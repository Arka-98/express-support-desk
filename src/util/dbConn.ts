import { Pool, Client, PoolClient } from 'pg'
import HttpException from './exception'

const pool = new Pool({
    user: process.env.AWS_POSTGRES_USERNAME,
    host: process.env.AWS_POSTGRES_HOST,
    database: process.env.AWS_POSTGRES_DATABASE,
    password: process.env.AWS_POSTGRES_PASSWORD,
    port: parseInt(process.env.AWS_POSTGRES_HOST!)
})

export const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'Arka1998',
    port: 5432
})

export const getPoolClient = async () => {
    return pool.connect()
}

pool.on('error', (err, client) => {
    if(err) throw new HttpException(err.message, 500)
})

export default pool