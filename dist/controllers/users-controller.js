"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.updateUser = exports.getUserById = exports.getUsers = exports.loginUser = exports.registerUser = void 0;
const dbConn_1 = __importDefault(require("../util/dbConn"));
const exception_1 = __importDefault(require("../util/exception"));
const bcrypt_1 = require("bcrypt");
const queries = __importStar(require("../util/queries"));
const util_1 = __importDefault(require("util"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sign = util_1.default.promisify(jsonwebtoken_1.default.sign);
const registerUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    const client = yield dbConn_1.default.connect();
    let hashedPassword;
    try {
        hashedPassword = yield (0, bcrypt_1.hash)(password, 12);
    }
    catch (error) {
        return next(new exception_1.default(error.message, 500));
    }
    const query = {
        text: queries.insertUser,
        values: [name, email, hashedPassword]
    };
    let result;
    try {
        result = yield client.query(query);
    }
    catch (error) {
        return next(new exception_1.default(error.message, 500));
    }
    finally {
        client.release();
    }
    res.status(201).json({ result });
});
exports.registerUser = registerUser;
const loginUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const client = yield dbConn_1.default.connect();
    let user;
    try {
        user = yield client.query(queries.getUserByEmail, [email]);
        if (!user.rowCount)
            return next(new exception_1.default('Email not registered', 401));
        const isValidPassword = yield (0, bcrypt_1.compare)(password, user.rows[0].password);
        if (!isValidPassword)
            return next(new exception_1.default('Wrong password', 401));
    }
    catch (error) {
        return next(new exception_1.default(error.message, 500));
    }
    let token;
    try {
        token = yield sign({ id: user.rows[0].id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2h' });
    }
    catch (error) {
        return next(new exception_1.default(error.message, 500));
    }
    res.status(200).json({ token });
});
exports.loginUser = loginUser;
const getUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield dbConn_1.default.connect();
    let users;
    try {
        users = yield client.query(queries.getUsers);
    }
    catch (error) {
        return next(new exception_1.default(error.message, 500));
    }
    finally {
        client.release();
    }
    res.status(200).json({ result: users === null || users === void 0 ? void 0 : users.rows });
});
exports.getUsers = getUsers;
const getUserById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.userId);
    if (!id) {
        return next(new exception_1.default('ID should be a number', 400));
    }
    const client = yield dbConn_1.default.connect();
    const query = {
        text: queries.getUserById,
        values: [id]
    };
    let user;
    try {
        user = yield client.query(query);
    }
    catch (error) {
        return next(new exception_1.default(error.message, 500));
    }
    finally {
        client.release();
    }
    res.status(200).json({ result: user === null || user === void 0 ? void 0 : user.rows });
});
exports.getUserById = getUserById;
const updateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.userId);
    if (!id) {
        return next(new exception_1.default('ID should be a number', 400));
    }
    const { name } = req.body;
    const client = yield dbConn_1.default.connect();
    const query = {
        text: queries.updateUser,
        values: [name, Math.floor(Date.now() / 1000), id]
    };
    let result;
    try {
        result = yield client.query(query);
    }
    catch (error) {
        return next(new exception_1.default(error.message, 500));
    }
    finally {
        client.release();
    }
    res.status(200).json({ result: result.rows[0] });
});
exports.updateUser = updateUser;
