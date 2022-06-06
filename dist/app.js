"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const users_routes_1 = __importDefault(require("./routes/users-routes"));
const tickets_routes_1 = __importDefault(require("./routes/tickets-routes"));
const notes_routes_1 = __importDefault(require("./routes/notes-routes"));
const exception_1 = __importDefault(require("./util/exception"));
const morgan_1 = __importDefault(require("morgan"));
const app = (0, express_1.default)();
app.use((0, morgan_1.default)('dev'));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use('/api/users', users_routes_1.default);
app.use('/api/tickets', tickets_routes_1.default);
app.use('/api/notes', notes_routes_1.default);
app.use((req, res, next) => {
    throw new exception_1.default('No route found', 404);
});
app.use((error, req, res, next) => {
    if (res.headersSent) {
        next(error);
    }
    if (error.validationError.length)
        return res.status(200).json({ message: error.message, errors: error.validationError });
    res.status(error.code).json({ message: error.message });
});
app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}...`);
});
