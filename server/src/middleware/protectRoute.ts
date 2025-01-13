import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import prisma from "../db/prisma";
import { JWT_SECRET } from "../constants";

interface DecodedToken extends JwtPayload {
    userId: number;
}

declare global {
    namespace Express {
        export interface Request {
            user: {
                id: number
            }
        }
    }
}

const protectRoute = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.jwt;
        if(!token) {
            return res
            .status(401)
            .json({error: "Unauthorized - No token provided"});
        }

        const decoded = jwt.verify(token, JWT_SECRET!) as DecodedToken;

        if (!decoded) {
            return res
            .status(401)
            .json({error: "Unauthorized - invalid token"});
        }

        const user = await prisma.user.findUnique({
            where: {id: decoded.userId}, 
            select: {
                id: true, 
                username: true, 
                firstName: true, 
                lastName: true, 
                profilePic: true}
    });
    if (!user) {
        return res
        .status(404)
        .json({error: "User not found"});
    }

    req.user = user;

    next();

    } catch (error: any) {
        console.log("Error in protectRoute middleware", error.message);
        return res
        .status(500)
        .json({error: "Internal server error"});
        
    }
}

export default protectRoute;