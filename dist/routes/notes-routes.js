"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const notes_controller_1 = require("../controllers/notes-controller");
const auth_1 = __importDefault(require("../middleware/auth"));
const check_error_1 = __importDefault(require("../middleware/check-error"));
const router = express_1.default.Router();
router.use(auth_1.default);
router.post('/ticket/:ticketId', [
    (0, express_validator_1.check)('text').notEmpty().isString()
], check_error_1.default, notes_controller_1.createNote);
router.get('/ticket/:ticketId', notes_controller_1.getNotesByTicketId);
exports.default = router;
