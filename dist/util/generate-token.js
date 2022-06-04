"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = require("jsonwebtoken");
const generateToken = (id) => {
    return new Promise((resolve, reject) => {
        (0, jsonwebtoken_1.sign)({ id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' }, (error, token) => {
            if (error)
                reject(error);
            resolve(token);
        });
    });
};
exports.default = generateToken;
