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
exports.deleteUser = exports.changeApprovalStatus = exports.getPendingApprovalCount = exports.registerAdmin = exports.updateUser = exports.getUsersPendingApproval = exports.getUserById = exports.getUsers = exports.loginUser = exports.registerUser = void 0;
const dbConn_1 = __importDefault(require("../util/dbConn"));
const exception_1 = __importDefault(require("../util/exception"));
const bcrypt_1 = require("bcrypt");
const queries = __importStar(require("../util/queries"));
const util_1 = __importDefault(require("util"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sign = util_1.default.promisify(jsonwebtoken_1.default.sign);
const registerUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    const { is_staff } = req.query;
    const isStaff = (is_staff === null || is_staff === void 0 ? void 0 : is_staff.toString()) === 'true';
    const client = yield dbConn_1.default.connect();
    try {
        const hashedPassword = yield (0, bcrypt_1.hash)(password, 12);
        const query = {
            text: queries.insertUser,
            values: [name, email, hashedPassword, isStaff]
        };
        const result = yield client.query(query);
        res.status(201).json({ result: 'User registered successfully' });
    }
    catch (error) {
        return next(new exception_1.default(error.code === '23505' ? 'Email already registered' : error.message, 500));
    }
    finally {
        client.release();
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const { is_staff, is_admin } = req.query;
    if (!is_staff || !is_admin)
        return next(new exception_1.default('Query parameters are required', 400));
    const client = yield dbConn_1.default.connect();
    try {
        const user = yield client.query(queries.getUserByEmail, [email, is_staff, is_admin]);
        if (!user.rowCount)
            return next(new exception_1.default('Email not registered', 401));
        if (user.rows[0].is_staff && !user.rows[0].is_staff_approved)
            return next(new exception_1.default('Admin approval is pending', 403));
        const isValidPassword = yield (0, bcrypt_1.compare)(password, user.rows[0].password);
        if (!isValidPassword)
            return next(new exception_1.default('Wrong password', 401));
        const token = yield sign({ id: user.rows[0].id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        const userData = {
            id: user.rows[0].id,
            name: user.rows[0].name,
            email: user.rows[0].email,
            is_staff: user.rows[0].is_staff,
            is_admin: user.rows[0].is_admin
        };
        res.status(200).json({ result: userData, token });
    }
    catch (error) {
        return next(new exception_1.default(error.message, 500));
    }
    finally {
        client.release();
    }
});
exports.loginUser = loginUser;
const getUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.is_admin))
        return next(new exception_1.default('User is not authorized to access this resource', 403));
    const { is_admin, is_staff } = req.query;
    const client = req.client || (yield dbConn_1.default.connect());
    try {
        const query = {
            text: queries.getUsers,
            values: [is_staff, is_admin]
        };
        const users = yield client.query(query);
        res.status(200).json({ result: users === null || users === void 0 ? void 0 : users.rows });
    }
    catch (error) {
        return next(new exception_1.default(error.message, 500));
    }
    finally {
        client.release();
    }
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
    try {
        const user = yield client.query(query);
        res.status(200).json({ result: user.rows[0] });
    }
    catch (error) {
        return next(new exception_1.default(error.message, 500));
    }
    finally {
        client.release();
    }
});
exports.getUserById = getUserById;
const getUsersPendingApproval = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    if (!((_b = req.user) === null || _b === void 0 ? void 0 : _b.is_admin))
        return next(new exception_1.default('User is not authorized to access this resource', 403));
    const client = req.client || (yield dbConn_1.default.connect());
    try {
        const users = yield client.query(queries.getStaffPendingApproval);
        res.status(200).json({ result: users.rows });
    }
    catch (error) {
        return next(new exception_1.default(error.message, 500));
    }
    finally {
        client.release();
    }
});
exports.getUsersPendingApproval = getUsersPendingApproval;
const registerAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    const client = yield dbConn_1.default.connect();
    try {
        const hashedPassword = yield (0, bcrypt_1.hash)(password, 12);
        const result = yield client.query(queries.insertAdmin, [name, email, hashedPassword]);
        res.status(201).json({ result: 'Admin registered' });
    }
    catch (error) {
        return next(new exception_1.default(error.message, 500));
    }
    finally {
        client.release();
    }
});
exports.registerAdmin = registerAdmin;
const updateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const { name } = req.body;
    const client = req.client || (yield dbConn_1.default.connect());
    const query = {
        text: queries.updateUser,
        values: [name, (_c = req.user) === null || _c === void 0 ? void 0 : _c.id]
    };
    try {
        const result = yield client.query(query);
    }
    catch (error) {
        return next(new exception_1.default(error.message, 500));
    }
    finally {
        client.release();
    }
    res.status(200).json({ result: 'User updated successfully' });
});
exports.updateUser = updateUser;
const getPendingApprovalCount = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    if (!((_d = req.user) === null || _d === void 0 ? void 0 : _d.is_admin))
        return next(new exception_1.default('User is not authorized to access this resource', 403));
    const client = req.client || (yield dbConn_1.default.connect());
    try {
        const result = yield client.query(queries.countStaffPendingApproval);
        res.status(200).json({ result: parseInt(result.rows[0].count) });
    }
    catch (error) {
        return next(new exception_1.default(error.message, 500));
    }
    finally {
        client.release();
    }
});
exports.getPendingApprovalCount = getPendingApprovalCount;
const changeApprovalStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    if (!((_e = req.user) === null || _e === void 0 ? void 0 : _e.is_admin))
        return next(new exception_1.default('User is not authorized to access this resource', 403));
    const id = parseInt(req.params.userId);
    if (!id) {
        return next(new exception_1.default('ID should be a number', 400));
    }
    const { approve } = req.query;
    const approvalStatus = (approve === null || approve === void 0 ? void 0 : approve.toString()) === 'true';
    const client = req.client || (yield dbConn_1.default.connect());
    try {
        const query = {
            text: queries.changeApprovalStatus,
            values: [approvalStatus, id]
        };
        const result = yield client.query(query);
        res.status(200).json({ result: 'Changed approval status' });
    }
    catch (error) {
        return next(new exception_1.default(error.message, 500));
    }
    finally {
        client.release();
    }
});
exports.changeApprovalStatus = changeApprovalStatus;
const deleteUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _f;
    if (!((_f = req.user) === null || _f === void 0 ? void 0 : _f.is_admin))
        return next(new exception_1.default('User is not authorized to access this resource', 403));
    const id = parseInt(req.params.userId);
    if (!id) {
        return next(new exception_1.default('ID should be a number', 400));
    }
    const client = req.client || (yield dbConn_1.default.connect());
    try {
        const result = yield client.query(queries.deleteUser, [id]);
        res.status(200).json({ result: 'Deleted user' });
    }
    catch (error) {
        return next(new exception_1.default(error.message, 500));
    }
    finally {
        client.release();
    }
});
exports.deleteUser = deleteUser;
