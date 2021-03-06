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
exports.getPoolClient = exports.client = void 0;
const pg_1 = require("pg");
const exception_1 = __importDefault(require("./exception"));
const pool = new pg_1.Pool({
    user: process.env.AWS_POSTGRES_USERNAME,
    host: process.env.AWS_POSTGRES_HOST,
    database: process.env.AWS_POSTGRES_DATABASE,
    password: process.env.AWS_POSTGRES_PASSWORD,
    port: parseInt(process.env.AWS_POSTGRES_HOST)
});
exports.client = new pg_1.Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'Arka1998',
    port: 5432
});
const getPoolClient = () => __awaiter(void 0, void 0, void 0, function* () {
    return pool.connect();
});
exports.getPoolClient = getPoolClient;
pool.on('error', (err, client) => {
    if (err)
        throw new exception_1.default(err.message, 500);
});
exports.default = pool;
