import express, { Router } from 'express'
import { check } from 'express-validator'
import { changeApprovalStatus, deleteUser, getPendingApprovalCount, getUserById, getUsers, getUsersPendingApproval, loginUser, registerAdmin, registerUser, updateUser } from '../controllers/users-controller'
import auth, { CustomRequest } from '../middleware/auth'
import checkErrors from '../middleware/check-error'

const router: Router = express.Router()

router.get('/', auth, getUsers)

router.post('/', [
    check('name').notEmpty().isString(),
    check('email').isEmail().normalizeEmail(),
    check('password').isLength({ min: 8 })
], checkErrors, registerUser)

router.post('/login', [
    check('email').isEmail().normalizeEmail(),
    check('password').notEmpty().isString()
], checkErrors, loginUser)

router.put('/', auth, [
    check('name').notEmpty().isString()
], checkErrors, updateUser)

router.get('/not-approved', auth, getUsersPendingApproval)

router.get('/count-not-approved', auth, getPendingApprovalCount)

router.post('/:userId', auth, changeApprovalStatus)

router.post('/admin', [
    check('name').notEmpty().isString(),
    check('email').isEmail().normalizeEmail(),
    check('password').isLength({ min: 8 })
], checkErrors, registerAdmin)

router.get('/:userId', getUserById)

router.delete('/:userId', auth, deleteUser)

export default router