import { NextFunction, Response } from "express";
import { CustomRequest } from "../middleware/auth";
import * as queries from "../util/queries"
import pool from "../util/dbConn";
import HttpException from "../util/exception";
import Note from "../models/note-model";
import TypedRequestBody from "../util/custom-request-interface";
import Ticket from "../models/ticket-model";

const getNotesByTicketId = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const ticketId = parseInt(req.params.ticketId)
    if(!ticketId) return next(new HttpException('ID should be a number', 400))
    const client = req.client || await pool.connect()
    try {
        const query = {
            text: queries.getNotesByTicketId,
            values: [ticketId]
        }
        const notes = await client.query<Note>(query)
        res.status(200).json({ result: notes.rows })
    } catch (error: any) {
        return next(new HttpException(error.message, 500))
    } finally {
        client.release()
    }
}

const createNote = async (req: TypedRequestBody<{text: string}>, res: Response, next: NextFunction) => {
    const ticket_id = parseInt(req.params.ticketId)
    const { text } = req.body
    const client = req.client || await pool.connect()
    try {
        let ticket
        if(req.user?.is_admin) {
            ticket = await client.query<Ticket>(queries.getTicketById, [ticket_id])
        } else {
            ticket = await client.query<Ticket>(req.user?.is_staff ? queries.getTicketByIdAndStaffId : queries.getTicketByIdAndUserId, [ticket_id, req.user?.id])
            if(!ticket.rowCount) return next(new HttpException('User is not authorized to add notes to other tickets', 403))
        }
        const query = {
            text: queries.insertNote,
            values: [req.user?.id, ticket_id, text] 
        }
        const response = await client.query(query)
        if((req.user?.is_staff || req.user?.is_admin) && ticket.rows[0].status === 'new') {
            await client.query(queries.updateTicket, [ticket.rows[0].product, ticket.rows[0].description, 'open', ticket_id])
        }
        res.status(201).json({ result: 'Created note successfully' })
    } catch (error: any) {
        return next(new HttpException(error.message, 500))
    } finally {
        client.release()
    }
}

export { createNote, getNotesByTicketId }