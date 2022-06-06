"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.getTicketsWithUserAndStaffName = exports.getTicketsByStaffId = exports.getTicketsCount = exports.getTicketById = exports.updateTicket = exports.createTicket = exports.getTicketsByUserId = void 0;
const queries = __importStar(require("../util/queries"));
const dbConn_1 = __importDefault(require("../util/dbConn"));
const ticket_model_1 = require("../models/ticket-model");
const exception_1 = __importDefault(require("../util/exception"));
const ses_sendEmail_1 = __importDefault(require("../util/aws-ses-lib/ses_sendEmail"));
const getTicketsByUserId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const client = req.client || (yield dbConn_1.default.connect());
    try {
        const query = {
            text: queries.getTicketsByUserId,
            values: [(_a = req.user) === null || _a === void 0 ? void 0 : _a.id]
        };
        const tickets = yield client.query(query);
        res.status(200).json({ result: tickets.rows });
    }
    catch (error) {
        return next(new exception_1.default(error.message, 500));
    }
    finally {
        client.release();
    }
});
exports.getTicketsByUserId = getTicketsByUserId;
const getTicketById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const id = parseInt(req.params.ticketId);
    if (!id)
        return next(new exception_1.default('ID should be a number', 400));
    const client = req.client || (yield dbConn_1.default.connect());
    try {
        const query = {
            text: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.is_staff) ? queries.getTicketWithUserNameById : queries.getTicketWithStaffNameById,
            values: [id]
        };
        const ticket = yield client.query(query);
        res.status(200).json({ result: ticket.rows[0] });
    }
    catch (error) {
        return next(new exception_1.default(error.message, 500));
    }
    finally {
        client.release();
    }
});
exports.getTicketById = getTicketById;
const getTicketsCount = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const { status } = req.query;
    if (!status)
        return next(new exception_1.default('Query parameters are required', 400));
    const client = req.client || (yield dbConn_1.default.connect());
    try {
        const query = {
            text: queries.countTickets,
            values: [(_c = req.user) === null || _c === void 0 ? void 0 : _c.id, status]
        };
        const result = yield client.query(query);
        res.status(200).json({ result: parseInt(result.rows[0].count) });
    }
    catch (error) {
        return next(new exception_1.default(error.message, 500));
    }
    finally {
        client.release();
    }
});
exports.getTicketsCount = getTicketsCount;
const createTicket = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e;
    const { product, description } = req.body;
    if (!Object.values(ticket_model_1.PRODUCT).includes(product)) {
        return next(new exception_1.default('Invalid inputs passed', 400));
    }
    const client = req.client || (yield dbConn_1.default.connect());
    try {
        const result = yield client.query(queries.getStaffIdWithLowestTickets);
        const query = {
            text: queries.insertTicket,
            values: [(_d = req.user) === null || _d === void 0 ? void 0 : _d.id, product, description, result.rows[0].staff_id]
        };
        const response = yield client.query(query);
        const data = yield (0, ses_sendEmail_1.default)(req.user.email, `Hi ${(_e = req.user) === null || _e === void 0 ? void 0 : _e.name.split(' ')[0]},<br><br>You have created a new ticket for your ${product}. Ticket ID for reference: ${response.rows[0].id}`, `New Ticket Created #${response.rows[0].id}`);
        res.status(201).json({ result: 'Created ticket successfully' });
    }
    catch (error) {
        return next(new exception_1.default(error.message, 500));
    }
    finally {
        client.release();
    }
});
exports.createTicket = createTicket;
const updateTicket = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _f, _g;
    const id = parseInt(req.params.ticketId);
    if (!id) {
        return next(new exception_1.default('ID should be a number', 400));
    }
    if (!Object.keys(req.body).length)
        return next(new exception_1.default('At least one field is required', 400));
    const { product, description, status } = req.body;
    if (status && status !== 'closed')
        return next(new exception_1.default('User is only authorized to close tickets', 403));
    if (product && !Object.values(ticket_model_1.PRODUCT).includes(product)) {
        return next(new exception_1.default('Product is not valid', 400));
    }
    const client = req.client || (yield dbConn_1.default.connect());
    try {
        const ticket = yield client.query(((_f = req.user) === null || _f === void 0 ? void 0 : _f.is_staff) ? queries.getTicketByIdAndStaffId : queries.getTicketByIdAndUserId, [id, (_g = req.user) === null || _g === void 0 ? void 0 : _g.id]);
        if (!ticket.rows.length) {
            return next(new exception_1.default('Ticket not found for user', 404));
        }
        const query = {
            text: queries.updateTicket,
            values: [product ? product : ticket.rows[0].product, description ? description : ticket.rows[0].description, status ? status : ticket.rows[0].status, id]
        };
        const response = yield client.query(query);
        res.status(200).json({ result: 'Updated ticket successfully' });
    }
    catch (error) {
        return next(new exception_1.default(error.message, 500));
    }
    finally {
        client.release();
    }
});
exports.updateTicket = updateTicket;
const getTicketsWithUserAndStaffName = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _h;
    if (!((_h = req.user) === null || _h === void 0 ? void 0 : _h.is_admin))
        return next(new exception_1.default('User is not authorized to access this resource', 403));
    const client = req.client || (yield dbConn_1.default.connect());
    try {
        const tickets = yield client.query(queries.getTicketsWithUserAndStaffName);
        res.status(200).json({ result: tickets.rows });
    }
    catch (error) {
        return next(new exception_1.default(error.message, 500));
    }
    finally {
        client.release();
    }
});
exports.getTicketsWithUserAndStaffName = getTicketsWithUserAndStaffName;
const getTicketsByStaffId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _j;
    const { status } = req.query;
    if (!(status === null || status === void 0 ? void 0 : status.toString().trim()))
        return next(new exception_1.default('Query parameters are required', 400));
    const statusArr = Array.from(new Set(status.toString().split(',')));
    statusArr.forEach(item => {
        if (!Object.values(ticket_model_1.STATUS).includes(item)) {
            return next(new exception_1.default('Invalid status values passed', 400));
        }
    });
    const client = req.client || (yield dbConn_1.default.connect());
    try {
        const query = {
            text: queries.getTicketsByStaffId,
            values: [(_j = req.user) === null || _j === void 0 ? void 0 : _j.id, statusArr]
        };
        const tickets = yield client.query(query);
        res.status(200).json({ result: tickets.rows });
    }
    catch (error) {
        return next(new exception_1.default(error.message, 500));
    }
    finally {
        client.release();
    }
});
exports.getTicketsByStaffId = getTicketsByStaffId;
