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
const client_ses_1 = require("@aws-sdk/client-ses");
const sesClient_1 = __importDefault(require("./sesClient"));
const params = { EmailAddress: "arkadiptadas989@outlook.com" };
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield sesClient_1.default.send(new client_ses_1.VerifyEmailIdentityCommand(params));
        console.log("Success.", data);
        return data; // For unit tests.
    }
    catch (err) {
        console.log("Error", err.stack);
    }
});
run();
