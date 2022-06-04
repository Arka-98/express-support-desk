import { NextFunction, Request, Response } from "express";
import HttpException from "../util/exception";
import util from 'util'
import jwt from 'jsonwebtoken'
import pool from "../util/dbConn";
import { getUserByIdWithoutPassword } from "../util/queries";
import User from "../models/user-model";
import { PoolClient } from "pg";

const verify = util.promisify<string, jwt.Secret | jwt.GetPublicKeyOrSecret, string | jwt.JwtPayload | undefined>(jwt.verify)

export interface CustomRequest extends Request {
    user?: User
    client?: PoolClient
}

const auth = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.startsWith('Bearer') && authHeader.split(' ')[1]
    if(!token) return next(new HttpException('No token found. Authorization failed', 403))
    const client = await pool.connect()
    try {
        const payload: any = await verify(token, process.env.ACCESS_TOKEN_SECRET!)
        const user = await client.query<User>(getUserByIdWithoutPassword, [payload!.id])
        if(user.rows[0].is_staff && !user.rows[0].is_staff_approved) {
            throw new Error('Admin approval is pending')
        }
        req.user = user.rows[0]
        req.client = client
    } catch (error: any) {
        client.release()
        return next(new HttpException(error.message, 401))
    }
    next()
}

export default auth