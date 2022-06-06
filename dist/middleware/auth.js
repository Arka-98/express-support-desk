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
const exception_1 = __importDefault(require("../util/exception"));
const util_1 = __importDefault(require("util"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dbConn_1 = __importDefault(require("../util/dbConn"));
const queries_1 = require("../util/queries");
const verify = util_1.default.promisify(jsonwebtoken_1.default.verify);
const auth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer') && authHeader.split(' ')[1];
    if (!token)
        return next(new exception_1.default('No token found. Authorization failed', 403));
    const client = yield dbConn_1.default.connect();
    try {
        const payload = yield verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = yield client.query(queries_1.getUserByIdWithoutPassword, [payload.id]);
        if (user.rows[0].is_staff && !user.rows[0].is_staff_approved) {
            throw new Error('Admin approval is pending');
        }
        req.user = user.rows[0];
        req.client = client;
    }
    catch (error) {
        client.release();
        return next(new exception_1.default(error.message, 401));
    }
    next();
});
exports.default = auth;
