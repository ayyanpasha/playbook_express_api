import { Client, ConnectConfig } from "ssh2";
import express, { Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";
import fetchUser from "../middleware/fetchUser";
import Container from "../model/Container";
import User from "../model/User";
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from 'fs';

dotenv.config();

const router = express.Router();

// SSH connection settings

// ROUTE 1: Create new Document: POST-'/api/document/new'
router.post("/new", fetchUser, async (req: Request, res: Response) => {

  const privateKey = process.env.privateKey;
  if(privateKey === null || privateKey === undefined) {
    return res.status(500).json({ errors: "Internal Server Error" });
  }
  const sshConfig: ConnectConfig = {
    host: process.env.ssh_hostname,
    port: 22,
    username: process.env.ssh_username,
    privateKey: fs.readFileSync(privateKey, 'utf8'),
  };
  try {
    console.log(1);
    //Create document, Permission & Admin
    const newContainer = new Container({ userId: req.headers["userId"] });

    // Docker command to execute
    const dockerCommand = `docker run --network codedamn --network-alias ${newContainer._id.toString()} -d terminal-codedamn`;

    let failure = false;
    // Connect to the SSH server and execute the Docker command
    const conn = new Client();
    conn
      .on("ready", () => {
        console.log("SSH connection established");

        // Execute the Docker command
        conn.exec(dockerCommand, async (err, stream) => {
          if (err) throw err;

          await stream
            .on("close", async (code: number, signal: string) => {
              console.log(`Docker command executed with code ${code}`);
              console.log(failure);
              if (!failure) {
                await newContainer.save();
                res.json(newContainer);
              } else {
                res.json({ error: "Error" });
              }
              conn.end();
            })
            .on("data", (data: Buffer) => {
              console.log(`STDOUT: ${data.toString()}`);
            })
            .stderr.on("data", (data: Buffer) => {
                console.log(`STDERR: ${data.toString()}`);
              failure = true;
            });
        });
      })
      .connect(sshConfig);
    //Store Document & Permission
  } catch (error) {
    return res.status(500).json({ errors: "Internal Server Error" });
  }
});

// ROUTE 2: Read Container: GET-'/api/container/id/:id'
router.get("/id/:id", async (req: Request, res: Response) => {
  try {
    const containerId = req.params.id;
    if (!mongoose.isValidObjectId(containerId)) {
      return res.status(404).json({ errors: "container doesn't exist" });
    }
    const container = await Container.findById(containerId);
    if (!container) {
      return res.status(404).json({ errors: "container doesn't exist" });
    }

    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).send({ errors: "Please login in" });
    }

    const decryptJWT = jwt.verify(token, process.env.JWT_SECRET as Secret) as {
      user: { id: string };
    };
    const userRequested = decryptJWT.user.id;
    if (container.userId.toString() === userRequested) {
      return res.status(200).json(container);
    }
    res.status(401).json("Unauthorized");
  } catch (error) {
    return res.status(500).json({ errors: error });
  }
});

// ROUTE 3: Delete Document: DELETE-'/api/document/id/:id'
router.delete("/id/:id", fetchUser, async (req: Request, res: Response) => {
  try {
    const containerId = req.params.id;
    //Check for valid ObjectID
    if (!mongoose.isValidObjectId(containerId)) {
      return res.status(404).json({ errors: "Container does not exist" });
    }
    //Authorization
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).send({ errors: "Please login in" });
    }
    //Check if Container Exist
    const container = await Container.findById(containerId);
    if (!container) {
      return res.status(404).json({ errors: "Container does not exist" });
    }
    const decryptJWT = jwt.verify(token, process.env.JWT_SECRET as Secret) as {
      user: { id: string };
    };
    const userRequested = decryptJWT.user.id;
    if (container.userId.toString() === userRequested) {
      await Container.findByIdAndDelete(containerId);
      return res.json({ success: `Deleted Successfully` });
    }
    //Delete
    res.status(401).json("Unauthorized");
  } catch (error) {
    return res
      .status(500)
      .json({ errors: `Container doesn't exist/Internal Server Error` });
  }
});

// ROUTE 4: Document List: GET-'/api/container/list'
router.get("/list", fetchUser, async (req: Request, res: Response) => {
  try {
    const container = await Container.find({ userId: req.headers["userId"] });
    res.json(container);
  } catch (error) {
    return res.status(500).json({ errors: error });
  }
});

export default router;
