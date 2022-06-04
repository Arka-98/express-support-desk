"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const users_routes_1 = __importDefault(require("./routes/users-routes"));
const exception_1 = __importDefault(require("./util/exception"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use('/api/users', users_routes_1.default);
app.use((req, res, next) => {
    throw new exception_1.default('No route found', 404);
});
app.use((error, req, res, next) => {
    // console.log(error.stack)
    if (res.headersSent) {
        next(error);
    }
    res.status(error.code).json({ message: error.message });
});
app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}...`);
});
