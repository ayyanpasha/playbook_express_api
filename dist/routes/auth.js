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
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fetchUser_1 = __importDefault(require("../middleware/fetchUser"));
const User_1 = __importDefault(require("../model/User"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = express_1.default.Router();
//Validation middleware for Signup
const validationSignup = [
    (0, express_validator_1.body)('email').isEmail().withMessage("Invalid email address"),
    (0, express_validator_1.body)('password').trim().isLength({ min: 3 }).withMessage("Password must be atleast 3 letters"),
];
// ROUTE 1: Create new User: POST-'/api/auth/signup'
router.post('/signup', validationSignup, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        req.body.email = req.body.email.toLowerCase();
        const { email, password } = req.body;
        let user = yield User_1.default.findOne({ email });
        if (user) {
            return res.status(400).json({ errors: "User with this email already exists" });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        user = yield User_1.default.create({ email, password: hashedPassword });
        const authToken = jsonwebtoken_1.default.sign({ user: { id: user.id } }, process.env.JWT_SECRET);
        res.status(201).json({ authToken });
    }
    catch (error) {
        // console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
}));
// Validation middleware for login
const validateLoginUserInput = [
    (0, express_validator_1.body)('email').isEmail().withMessage("Invalid email address"),
    (0, express_validator_1.body)('password').trim().notEmpty().withMessage("Password cannot be blank"),
];
// ROUTE 2: Login User: POST-'/api/auth/login'
router.post('/login', validateLoginUserInput, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        req.body.email = req.body.email.toLowerCase();
        const { email, password } = req.body;
        let user = yield User_1.default.findOne({ email });
        if (!user || !(yield bcryptjs_1.default.compare(password, user.password))) {
            return res.status(400).json({ errors: "Invalid credentials" });
        }
        const authToken = jsonwebtoken_1.default.sign({ user: { id: user.id } }, process.env.JWT_SECRET);
        res.status(200).json({ authToken });
    }
    catch (error) {
        // console.error(error.message);
        res.status(500).json({ errors: 'Internal Server Error' });
    }
}));
// ROUTE 3: Authenticate User: POST-'/api/auth/'
router.post('/', fetchUser_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.headers['userId'];
        let currentUser = yield User_1.default.findOne({ _id: userId }).select("-password");
        if (!currentUser) {
            return res.status(400).json({ errors: "Invalid credentials" });
        }
        res.json(currentUser);
    }
    catch (error) {
        res.status(500).json({ errors: 'Internal Server Error' });
    }
}));
exports.default = router;
