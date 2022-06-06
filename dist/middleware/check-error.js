"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const exception_1 = __importDefault(require("../util/exception"));
const checkErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new exception_1.default('Invalid input / Wrong arguments passed', 400, errors.array()));
    }
    next();
};
exports.default = checkErrors;
