import express, { Router } from 'express'
import { check } from 'express-validator'
import { createNote, getNotesByTicketId } from '../controllers/notes-controller'
import auth from '../middleware/auth'
import checkErrors from '../middleware/check-error'

const router: Router = express.Router()

router.use(auth)

router.post('/ticket/:ticketId', [
    check('text').notEmpty().isString()
], checkErrors, createNote)

router.get('/ticket/:ticketId', getNotesByTicketId)

export default router