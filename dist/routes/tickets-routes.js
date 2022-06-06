"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const tickets_controller_1 = require("../controllers/tickets-controller");
const auth_1 = __importDefault(require("../middleware/auth"));
const check_error_1 = __importDefault(require("../middleware/check-error"));
const router = express_1.default.Router();
router.use(auth_1.default);
router.get('/', tickets_controller_1.getTicketsWithUserAndStaffName);
router.get('/count', tickets_controller_1.getTicketsCount);
router.get('/user', tickets_controller_1.getTicketsByUserId);
router.get('/staff', tickets_controller_1.getTicketsByStaffId);
router.post('/', [
    (0, express_validator_1.check)('product').notEmpty().isString(),
    (0, express_validator_1.check)('description').notEmpty().isString()
], check_error_1.default, tickets_controller_1.createTicket);
router.get('/:ticketId', tickets_controller_1.getTicketById);
router.put('/:ticketId', [
    (0, express_validator_1.check)('product').optional({ checkFalsy: true }),
    (0, express_validator_1.check)('description').optional({ checkFalsy: true }),
    (0, express_validator_1.check)('status').optional({ checkFalsy: true })
], check_error_1.default, tickets_controller_1.updateTicket);
exports.default = router;
