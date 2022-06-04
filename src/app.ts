import 'dotenv/config'
import express, { Express, NextFunction, Request, Response } from "express";
import cors from 'cors'
import userRouter from './routes/users-routes'
import ticketRouter from './routes/tickets-routes'
import noteRouter from './routes/notes-routes'
import HttpException from "./util/exception";
import morgan from 'morgan'

const app: Express = express()

app.use(morgan('dev'))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/api/users', userRouter)
app.use('/api/tickets', ticketRouter)
app.use('/api/notes', noteRouter)

app.use((req, res, next) => {
    throw new HttpException('No route found', 404)
})

app.use((error: HttpException, req: Request, res: Response, next: NextFunction) => {
    if(res.headersSent) {
        next(error)
    }
    if(error.validationError.length) return res.status(200).json({ message: error.message, errors: error.validationError })
    res.status(error.code).json({ message: error.message })
})

app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}...`)    
})