import express, { Application } from "express";
import dotenv from 'dotenv'

dotenv.config()

const app: Application = express()

app.get('/', (req, res, next) => {
    res.status(200).json({ message: 'hello from express ts' })
})

app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}...`)    
})