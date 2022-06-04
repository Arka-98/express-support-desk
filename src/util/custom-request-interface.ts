import { Request } from "express";
import { CustomRequest } from "../middleware/auth";
import User from "../models/user-model";

interface TypedRequestBody<T> extends CustomRequest {
    body: T
}

export default TypedRequestBody