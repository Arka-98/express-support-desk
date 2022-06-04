"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const exception_1 = __importDefault(require("./exception"));
// console.log(process.env.AWS_POSTGRES_PASSWORD, process.env.AWS_POSTGRES_HOST, process.env.AWS_POSTGRES_DATABASE, process.env.AWS_POSTGRES_USERNAME)
const pool = new pg_1.Pool({
    user: process.env.AWS_POSTGRES_USERNAME,
    host: process.env.AWS_POSTGRES_HOST,
    database: process.env.AWS_POSTGRES_DATABASE,
    password: process.env.AWS_POSTGRES_PASSWORD,
    port: parseInt(process.env.AWS_POSTGRES_HOST)
});
pool.on('error', (err, client) => {
    if (err)
        throw new exception_1.default(err.message, 500);
});
exports.default = pool;
