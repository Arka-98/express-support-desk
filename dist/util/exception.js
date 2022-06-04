"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HttpException extends Error {
    constructor(message = 'Internal Server Error', code = 500) {
        super(message);
        this.code = code;
    }
}
exports.default = HttpException;
