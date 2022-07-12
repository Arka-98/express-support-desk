import { NextFunction, Request, Response } from "express";
import * as queries from '../util/queries'
import pool from "../util/dbConn";
import Ticket, { PRODUCT, STATUS } from "../models/ticket-model";
import HttpException from "../util/exception";
import TypedRequestBody from "../util/custom-request-interface";
import { CustomRequest } from "../middleware/auth";
import sendEmail from "../util/aws-ses-lib/ses_sendEmail";
import { QueryResult } from "pg";

const getTicketsByUserId = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const client = req.client || await pool.connect()
    try {
        const query = {
            text: queries.getTicketsByUserId,
            values: [req.user?.id]
        }
        const tickets = await client.query<Ticket>(query)
        res.status(200).json({ result: tickets.rows })
    } catch (error: any) {
        return next(new HttpException(error.message, 500))
    } finally {
        client.release()
    }
}

const getTicketById = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.ticketId)
    if(!id) return next(new HttpException('ID should be a number', 400))
    const client = req.client || await pool.connect()
    try {
        const query = {
            text: req.user?.is_staff ? queries.getTicketWithUserNameById : queries.getTicketWithStaffNameById,
            values: [id]
        }
        const ticket = await client.query(query)
        res.status(200).json({ result: ticket.rows[0] })
    } catch (error: any) {
        return next(new HttpException(error.message, 500))
    } finally {
        client.release()
    }
}

const getTicketsCount = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { status } = req.query
    if(!status) return next(new HttpException('Query parameters are required', 400))
    const client = req.client || await pool.connect()
    try {
        const query = {
            text: queries.countTickets,
            values: [req.user?.id, status]
        }
        const result = await client.query<{ count: string }>(query)
        res.status(200).json({ result: parseInt(result.rows[0].count) })
    } catch (error: any) {
        return next(new HttpException(error.message, 500))
    } finally {
        client.release()
    }
}

const createTicket = async (req: TypedRequestBody<{product: string, description: string }>, res: Response, next: NextFunction) => {
    const { product, description } = req.body
    if(!Object.values(PRODUCT).includes(product as unknown as PRODUCT)) {
        return next(new HttpException('Invalid inputs passed', 400))
    }
    const client = req.client || await pool.connect()
    try {
        const result = await client.query<{ staff_id: number }>(queries.getStaffIdWithLowestTickets)
        const query = {
            text: queries.insertTicket,
            values: [req.user?.id, product, description, result.rows[0].staff_id]
        }
        const response = await client.query<{ id: number }>(query)
        const data = await sendEmail(req.user!.email, `Hi ${req.user?.name.split(' ')[0]},<br><br>You have created a new ticket for your ${product}. Ticket ID for reference: ${response.rows[0].id}`, `New Ticket Created #${response.rows[0].id}`)
        res.status(201).json({ result: 'Created ticket successfully' })
    } catch (error: any) {
        return next(new HttpException(error.message, 500))
    } finally {
        client.release()
    }
}

const updateTicket = async (req: TypedRequestBody<{product: string, description: string, status: STATUS }>, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.ticketId)
    if(!id) {
        return next(new HttpException('ID should be a number', 400))
    }
    if(!Object.keys(req.body).length) return next(new HttpException('At least one field is required', 400))
    const { product, description, status } = req.body
    if(status && status !== 'closed') return next(new HttpException('User is only authorized to close tickets', 403))
    if(product && !Object.values(PRODUCT).includes(product as unknown as PRODUCT)) {
        return next(new HttpException('Product is not valid', 400))
    }
    const client = req.client || await pool.connect()
    try {
        let ticket: QueryResult<Ticket>
        if(req.user?.is_admin) {
            ticket = await client.query<Ticket>(queries.getTicketById, [id])
        } else {
            ticket = await client.query<Ticket>(req.user?.is_staff ? queries.getTicketByIdAndStaffId : queries.getTicketByIdAndUserId, [id, req.user?.id])
        }
        if(!ticket.rows.length) {
            return next(new HttpException('Ticket not found for user', 404))
        }
        const query = {
            text: queries.updateTicket,
            values: [product ? product : ticket.rows[0].product, description ? description : ticket.rows[0].description, status ? status : ticket.rows[0].status, id]
        }
        const response = await client.query(query)
        res.status(200).json({ result: 'Updated ticket successfully' })
    } catch (error: any) {
        return next(new HttpException(error.message, 500))
    } finally {
        client.release()
    }
}

const getTicketsWithUserAndStaffName = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if(!req.user?.is_admin) return next(new HttpException('User is not authorized to access this resource', 403))
    const client = req.client || await pool.connect()
    try {
        const tickets = await client.query(queries.getTicketsWithUserAndStaffName)
        res.status(200).json({ result: tickets.rows })
    } catch (error: any) {
        return next(new HttpException(error.message, 500))
    } finally {
        client.release()
    }
}

const getTicketsByStaffId = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { status } = req.query
    if(!status?.toString().trim()) return next(new HttpException('Query parameters are required', 400))
    const statusArr = Array.from(new Set(status.toString().split(',')))
    statusArr.forEach(item => {
        if(!Object.values(STATUS).includes(item as unknown as STATUS)) {
            return next(new HttpException('Invalid status values passed', 400))
        }
    })
    const client = req.client || await pool.connect()
    try {
        const query = {
            text: queries.getTicketsByStaffId,
            values: [req.user?.id, statusArr]
        }
        const tickets = await client.query<Ticket>(query)
        res.status(200).json({ result: tickets.rows })
    } catch (error: any) {
        return next(new HttpException(error.message, 500))
    } finally {
        client.release()
    }
}

export { getTicketsByUserId, createTicket, updateTicket, getTicketById, getTicketsCount, getTicketsByStaffId, getTicketsWithUserAndStaffName }