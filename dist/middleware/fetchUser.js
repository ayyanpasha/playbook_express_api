"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv")); // Import dotenv
dotenv_1.default.config(); // Load environment variables from .env file
const fetchUser = (req, res, next) => {
    var _a;
    const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
    if (!token) {
        return res.status(401).send({ errors: "Please login in" });
    }
    try {
        // Type assertion on data
        const data = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.headers["userId"] = data.user.id;
        next();
    }
    catch (error) {
        return res.status(401).send({ errors: "Not Authorized" });
    }
};
exports.default = fetchUser;
