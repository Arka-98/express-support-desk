import { ValidationError } from "express-validator"

class HttpException extends Error {
    code: number
    validationError: ValidationError[]
    constructor(message: string = 'Internal Server Error', code: number = 500, validationError: ValidationError[] = []) {
        super(message)
        this.validationError = validationError
        this.code = code
    }
}

export default HttpException