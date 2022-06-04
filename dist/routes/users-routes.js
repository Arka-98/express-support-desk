"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const users_controller_1 = require("../controllers/users-controller");
const check_error_1 = __importDefault(require("../middleware/check-error"));
const router = express_1.default.Router();
router.get('/', users_controller_1.getUsers);
router.get('/:userId', users_controller_1.getUserById);
router.post('/', [
    (0, express_validator_1.check)('name').notEmpty(),
    (0, express_validator_1.check)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.check)('password').isLength({ min: 8 }).isAlphanumeric()
], check_error_1.default, users_controller_1.registerUser);
router.post('/login', [
    (0, express_validator_1.check)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.check)('password').notEmpty()
], check_error_1.default, users_controller_1.loginUser);
router.put('/:userId', [
    (0, express_validator_1.check)('name').notEmpty()
], check_error_1.default, users_controller_1.updateUser);
exports.default = router;
