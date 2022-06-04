import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import HttpException from "../util/exception";

const checkErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return next(new HttpException('Invalid input / Wrong arguments passed', 400, errors.array()))
    }
    next()
}

export default checkErrors