"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ssh2_1 = require("ssh2");
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fetchUser_1 = __importDefault(require("../middleware/fetchUser"));
const Container_1 = __importDefault(require("../model/Container"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = express_1.default.Router();
// SSH connection settings
const sshConfig = {
    host: "localhost",
    port: 22,
    username: "ayyanpasha",
    password: "Ayyan1!PMa",
};
// ROUTE 1: Create new Document: POST-'/api/document/new'
router.post("/new", fetchUser_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(1);
        //Create document, Permission & Admin
        const newContainer = new Container_1.default({ userId: req.headers["userId"] });
        // Docker command to execute
        const dockerCommand = `docker run --network codedamn --network-alias ${newContainer._id.toString()} -d terminal-codedamn`;
        let failure = false;
        // Connect to the SSH server and execute the Docker command
        const conn = new ssh2_1.Client();
        conn
            .on("ready", () => {
            console.log("SSH connection established");
            // Execute the Docker command
            conn.exec(dockerCommand, (err, stream) => __awaiter(void 0, void 0, void 0, function* () {
                if (err)
                    throw err;
                yield stream
                    .on("close", (code, signal) => __awaiter(void 0, void 0, void 0, function* () {
                    console.log(`Docker command executed with code ${code}`);
                    console.log(failure);
                    if (!failure) {
                        yield newContainer.save();
                        res.json(newContainer);
                    }
                    else {
                        res.json({ error: "Error" });
                    }
                    conn.end();
                }))
                    .on("data", (data) => {
                    console.log(`STDOUT: ${data.toString()}`);
                })
                    .stderr.on("data", (data) => {
                    console.log(`STDERR: ${data.toString()}`);
                    failure = true;
                });
            }));
        })
            .connect(sshConfig);
        //Store Document & Permission
    }
    catch (error) {
        return res.status(500).json({ errors: "Internal Server Error" });
    }
}));
// ROUTE 2: Read Document: GET-'/api/document/id/:id'
router.get("/id/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const containerId = req.params.id;
        if (!mongoose_1.default.isValidObjectId(containerId)) {
            return res.status(404).json({ errors: "container doesn't exist" });
        }
        const container = yield Container_1.default.findById(containerId);
        if (!container) {
            return res.status(404).json({ errors: "container doesn't exist" });
        }
        const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
        if (!token) {
            return res.status(401).send({ errors: "Please login in" });
        }
        const decryptJWT = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userRequested = decryptJWT.user.id;
        if (container.userId.toString() === userRequested) {
            return res.status(200).json(container);
        }
        res.status(401).json("Unauthorized");
    }
    catch (error) {
        return res.status(500).json({ errors: error });
    }
}));
// ROUTE 3: Delete Document: DELETE-'/api/document/id/:id'
router.delete("/id/:id", fetchUser_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const containerId = req.params.id;
        //Check for valid ObjectID
        if (!mongoose_1.default.isValidObjectId(containerId)) {
            return res.status(404).json({ errors: "Container does not exist" });
        }
        //Authorization
        const token = (_b = req.header("Authorization")) === null || _b === void 0 ? void 0 : _b.replace("Bearer ", "");
        if (!token) {
            return res.status(401).send({ errors: "Please login in" });
        }
        //Check if Container Exist
        const container = yield Container_1.default.findById(containerId);
        if (!container) {
            return res.status(404).json({ errors: "Container does not exist" });
        }
        const decryptJWT = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userRequested = decryptJWT.user.id;
        if (container.userId.toString() === userRequested) {
            yield Container_1.default.findByIdAndDelete(containerId);
            return res.json({ success: `Deleted Successfully` });
        }
        //Delete
        res.status(401).json("Unauthorized");
    }
    catch (error) {
        return res
            .status(500)
            .json({ errors: `Container doesn't exist/Internal Server Error` });
    }
}));
// ROUTE 4: Document List: GET-'/api/container/list'
router.get("/list", fetchUser_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const container = yield Container_1.default.find({ userId: req.headers["userId"] });
        res.json(container);
    }
    catch (error) {
        return res.status(500).json({ errors: error });
    }
}));
exports.default = router;
