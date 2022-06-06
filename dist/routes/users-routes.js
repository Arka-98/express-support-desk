"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const users_controller_1 = require("../controllers/users-controller");
const auth_1 = __importDefault(require("../middleware/auth"));
const check_error_1 = __importDefault(require("../middleware/check-error"));
const router = express_1.default.Router();
router.get('/', auth_1.default, users_controller_1.getUsers);
router.post('/', [
    (0, express_validator_1.check)('name').notEmpty().isString(),
    (0, express_validator_1.check)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.check)('password').isLength({ min: 8 })
], check_error_1.default, users_controller_1.registerUser);
router.post('/login', [
    (0, express_validator_1.check)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.check)('password').notEmpty().isString()
], check_error_1.default, users_controller_1.loginUser);
router.put('/', auth_1.default, [
    (0, express_validator_1.check)('name').notEmpty().isString()
], check_error_1.default, users_controller_1.updateUser);
router.get('/not-approved', auth_1.default, users_controller_1.getUsersPendingApproval);
router.get('/count-not-approved', auth_1.default, users_controller_1.getPendingApprovalCount);
router.post('/:userId', auth_1.default, users_controller_1.changeApprovalStatus);
router.post('/admin', [
    (0, express_validator_1.check)('name').notEmpty().isString(),
    (0, express_validator_1.check)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.check)('password').isLength({ min: 8 })
], check_error_1.default, users_controller_1.registerAdmin);
router.get('/:userId', users_controller_1.getUserById);
router.delete('/:userId', auth_1.default, users_controller_1.deleteUser);
exports.default = router;
