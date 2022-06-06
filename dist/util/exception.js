"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HttpException extends Error {
    constructor(message = 'Internal Server Error', code = 500, validationError = []) {
        super(message);
        this.validationError = validationError;
        this.code = code;
    }
}
exports.default = HttpException;
