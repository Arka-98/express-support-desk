import express, { Router } from "express";
import { check } from "express-validator";
import { createTicket, getTicketById, getTicketsByStaffId, getTicketsByUserId, getTicketsCount, getTicketsWithUserAndStaffName, updateTicket } from "../controllers/tickets-controller";
import auth from "../middleware/auth";
import checkErrors from "../middleware/check-error";

const router: Router = express.Router()

router.use(auth)

router.get('/', getTicketsWithUserAndStaffName)

router.get('/count', getTicketsCount)

router.get('/user', getTicketsByUserId)

router.get('/staff', getTicketsByStaffId)

router.post('/', [
    check('product').notEmpty().isString(),
    check('description').notEmpty().isString()
], checkErrors, createTicket)

router.get('/:ticketId', getTicketById)

router.put('/:ticketId', [
    check('product').optional({ checkFalsy: true }),
    check('description').optional({ checkFalsy: true }),
    check('status').optional({ checkFalsy: true })
], checkErrors, updateTicket)

export default router