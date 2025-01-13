import jwt from "jsonwebtoken";
import {Response} from "express";
import { JWT_SECRET, NODE_ENV } from "../constants";

const generateToken = (userId: number, res: Response) => {
    const token = jwt.sign({ userId }, JWT_SECRET!, {
        expiresIn: "15d"
    })

    res.cookie("jwt", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000,
        httpOnly: true, //prevent xss cross site scripting
        sameSite: "strict", // CSRF attack cross-site request forgery
        secure: NODE_ENV !== "development" // HTTPS 
    })

    return token;
}

export default generateToken;