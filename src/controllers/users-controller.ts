import { NextFunction, Request, Response } from "express";
import pool, { client } from "../util/dbConn";
import HttpException from "../util/exception";
import { compare, hash } from 'bcrypt'
import * as queries from '../util/queries'
import util from 'util'
import jwt from 'jsonwebtoken'
import { CustomRequest } from "../middleware/auth";
import TypedRequestBody from "../util/custom-request-interface";
import User from "../models/user-model";

const sign = util.promisify<string | object | Buffer, jwt.Secret, jwt.SignOptions | undefined, unknown>(jwt.sign)

const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body
    const { is_staff } = req.query
    const isStaff = is_staff?.toString() === 'true'
    const client = await pool.connect()
    try {
        const hashedPassword = await hash(password, 12)
        const query = {
            text: queries.insertUser,
            values: [name, email, hashedPassword, isStaff]
        }
        const result = await client.query(query)
        res.status(201).json({ result: 'User registered successfully' })
    } catch (error: any) {
        return next(new HttpException(error.code === '23505' ? 'Email already registered' : error.message, 500))
    } finally {
        client.release()
    }
}

const loginUser = async (req: TypedRequestBody<{ email: string, password: string }>, res: Response, next: NextFunction) => {
    const { email, password } = req.body
    const { is_staff, is_admin } = req.query
    if(!is_staff || !is_admin) return next(new HttpException('Query parameters are required', 400))
    const client = await pool.connect()
    try {
        const user = await client.query<User>(queries.getUserByEmail, [email, is_staff, is_admin])
        if(!user.rowCount) return next(new HttpException('Email not registered', 401))
        if(user.rows[0].is_staff && !user.rows[0].is_staff_approved) return next(new HttpException('Admin approval is pending', 403))
        const isValidPassword = await compare(password, user.rows[0].password)
        if(!isValidPassword) return next(new HttpException('Wrong password', 401))
        const token = await sign({ id: user.rows[0].id }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '1h' })
        const userData = {
            id: user.rows[0].id,
            name: user.rows[0].name,
            email: user.rows[0].email,
            is_staff: user.rows[0].is_staff,
            is_admin: user.rows[0].is_admin
        }
        res.status(200).json({ result: userData, token })
    } catch (error: any) {
        return next(new HttpException(error.message, 500))
    } finally {
        client.release()
    }
}

const getUsers = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if(!req.user?.is_admin) return next(new HttpException('User is not authorized to access this resource', 403))
    const { is_admin, is_staff } = req.query
    const client = req.client || await pool.connect()
    try {
        const query = {
            text: queries.getUsers,
            values: [is_staff, is_admin]
        }
        const users = await client.query<User>(query)
        res.status(200).json({ result: users?.rows })
    } catch (error: any) {
        return next(new HttpException(error.message, 500))
    }
    finally {
        client.release()
    }
}

const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.userId)
    if(!id) {
        return next(new HttpException('ID should be a number', 400))
    }
    const client = await pool.connect()
    const query = {
        text: queries.getUserById,
        values: [id]
    }
    try {
        const user = await client.query(query)
        res.status(200).json({ result: user.rows[0] })
    } catch (error: any) {
        return next(new HttpException(error.message, 500))
    } finally {
        client.release()
    }
}

const getUsersPendingApproval = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if(!req.user?.is_admin) return next(new HttpException('User is not authorized to access this resource', 403))
    const client = req.client || await pool.connect()
    try {
        const users = await client.query<User>(queries.getStaffPendingApproval)
        res.status(200).json({ result: users.rows })
    } catch (error: any) {
        return next(new HttpException(error.message, 500))
    } finally {
        client.release()
    }
}

const registerAdmin = async (req: TypedRequestBody<{ name: string, email: string, password: string }>, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body
    const client = await pool.connect()
    try {
        const hashedPassword = await hash(password, 12)
        const result = await client.query(queries.insertAdmin, [name, email, hashedPassword])
        res.status(201).json({ result: 'Admin registered' })
    } catch (error: any) {
        return next(new HttpException(error.message, 500))
    } finally {
        client.release()
    }
}

const updateUser = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { name } = req.body
    const client = req.client || await pool.connect()
    const query = {
        text: queries.updateUser,
        values: [name, req.user?.id]
    }
    try {
        const result = await client.query(query)
    } catch (error: any) {
        return next(new HttpException(error.message, 500))
    } finally {
        client.release()
    }
    res.status(200).json({ result: 'User updated successfully' })
}

const getPendingApprovalCount = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if(!req.user?.is_admin) return next(new HttpException('User is not authorized to access this resource', 403))
    const client = req.client || await pool.connect()
    try {
        const result = await client.query<{ count: string }>(queries.countStaffPendingApproval)
        res.status(200).json({ result: parseInt(result.rows[0].count) })
    } catch (error: any) {
        return next(new HttpException(error.message, 500))
    } finally {
        client.release()
    }
}

const changeApprovalStatus = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if(!req.user?.is_admin) return next(new HttpException('User is not authorized to access this resource', 403))
    const id = parseInt(req.params.userId)
    if(!id) {
        return next(new HttpException('ID should be a number', 400))
    }
    const { approve } = req.query
    const approvalStatus = approve?.toString() === 'true'
    const client = req.client || await pool.connect()
    try {
        const query = {
            text: queries.changeApprovalStatus,
            values: [approvalStatus, id]
        }
        const result = await client.query(query)
        res.status(200).json({ result: 'Changed approval status' })
    } catch (error: any) {
        return next(new HttpException(error.message, 500))
    } finally {
        client.release()
    }
}

const deleteUser = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if(!req.user?.is_admin) return next(new HttpException('User is not authorized to access this resource', 403))
    const id = parseInt(req.params.userId)
    if(!id) {
        return next(new HttpException('ID should be a number', 400))
    }
    const client = req.client || await pool.connect()
    try {
        const result = await client.query(queries.deleteUser, [id])
        res.status(200).json({ result: 'Deleted user' })
    } catch (error: any) {
        return next(new HttpException(error.message, 500))
    } finally {
        client.release()
    }
}

export { registerUser, loginUser, getUsers, getUserById, getUsersPendingApproval, updateUser, registerAdmin, getPendingApprovalCount, changeApprovalStatus, deleteUser }