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
exports.getNotesByTicketId = exports.createNote = void 0;
const queries = __importStar(require("../util/queries"));
const dbConn_1 = __importDefault(require("../util/dbConn"));
const exception_1 = __importDefault(require("../util/exception"));
const ses_sendEmail_1 = __importDefault(require("../util/aws-ses-lib/ses_sendEmail"));
const getNotesByTicketId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const ticketId = parseInt(req.params.ticketId);
    if (!ticketId)
        return next(new exception_1.default('ID should be a number', 400));
    const client = req.client || (yield dbConn_1.default.connect());
    try {
        const query = {
            text: queries.getNotesByTicketId,
            values: [ticketId]
        };
        const notes = yield client.query(query);
        res.status(200).json({ result: notes.rows });
    }
    catch (error) {
        return next(new exception_1.default(error.message, 500));
    }
    finally {
        client.release();
    }
});
exports.getNotesByTicketId = getNotesByTicketId;
const createNote = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const ticket_id = parseInt(req.params.ticketId);
    const { text } = req.body;
    const client = req.client || (yield dbConn_1.default.connect());
    try {
        let ticket;
        if ((_a = req.user) === null || _a === void 0 ? void 0 : _a.is_admin) {
            ticket = yield client.query(queries.getTicketById, [ticket_id]);
        }
        else {
            ticket = yield client.query(((_b = req.user) === null || _b === void 0 ? void 0 : _b.is_staff) ? queries.getTicketByIdAndStaffId : queries.getTicketByIdAndUserId, [ticket_id, (_c = req.user) === null || _c === void 0 ? void 0 : _c.id]);
            if (!ticket.rowCount)
                return next(new exception_1.default('User is not authorized to add notes to other tickets', 403));
        }
        if (((_d = req.user) === null || _d === void 0 ? void 0 : _d.is_admin) || ((_e = req.user) === null || _e === void 0 ? void 0 : _e.is_staff)) {
            const data = yield (0, ses_sendEmail_1.default)(ticket.rows[0].user_email, `Hi ${ticket.rows[0].user_name.split(' ')[0]},<br><br>You have a new reply on Ticket #${ticket.rows[0].id} from ${req.user.name} ${req.user.is_admin ? '(Support Desk Admin)' : '(Support Executive)'}`, `New reply on Ticket #${ticket.rows[0].id}`);
        }
        const query = {
            text: queries.insertNote,
            values: [(_f = req.user) === null || _f === void 0 ? void 0 : _f.id, ticket_id, text]
        };
        const response = yield client.query(query);
        if ((((_g = req.user) === null || _g === void 0 ? void 0 : _g.is_staff) || ((_h = req.user) === null || _h === void 0 ? void 0 : _h.is_admin)) && ticket.rows[0].status === 'new') {
            yield client.query(queries.updateTicket, [ticket.rows[0].product, ticket.rows[0].description, 'open', ticket_id]);
        }
        res.status(201).json({ result: 'Created note successfully' });
    }
    catch (error) {
        return next(new exception_1.default(error.message, 500));
    }
    finally {
        client.release();
    }
});
exports.createNote = createNote;
