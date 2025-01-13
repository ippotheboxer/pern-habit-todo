import { Request, Response } from "express";
import prisma from "../db/prisma";
import bcryptjs from "bcryptjs";
import generateToken from "../utils/generateToken";


export const signUp = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { firstName, lastName , username, password, confirmPassword, gender } = req.body;
        if (!firstName || !lastName || !username || !password || !confirmPassword || !gender) {
            return res
            .status(400)
            .json({ error: "Please fill in all fields" });
        }
        if (password !== confirmPassword) {
            return res
            .status(400)
            .json({ error: "Passwords don't match" });
        }
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (user) {
            return res
            .status(400)
            .json({ error: "Username already taken" });
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);
        const profilePic = `https://avatar.iran.liara.run/username?username=${firstName+lastName}`;

        const newUser = await prisma.user.create({
            data: {
                username,
                firstName,
                lastName,
                password: hashedPassword,
                gender,
                profilePic: profilePic
            }
        });
        if (newUser) {
            generateToken(newUser.id, res);

            res
            .status(201)
            .json({
                id: newUser.id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                username: newUser.username,
                profilePic: newUser.profilePic
            })
        } else {
            res.status(400).json({ error: "Invalid user data" });
        }
    
    } catch (error: any) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const {username, password} = req.body;
        const user = await prisma.user.findUnique({where: { username }});
        if (!user) {
            return res
            .status(400)
            .json({ error: "Incorrect username" });
        }
        const isPasswordCorrect = await bcryptjs.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res
            .status(400)
            .json({ error: "Incorrect password" });
        }

        generateToken(user.id, res);

        res.status(200).json({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            profilePic: user.profilePic
        });

    } catch (error: any) {
        console.log("Error in login controller", error.message);
        res
        .status(500)
        .json({ error: "Internal server error" });
    }

}
export const logout = async (req: Request, res: Response) => {
    try {
        res
        .status(200)
        .cookie('jwt', "", {maxAge: 0})
        .json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error: any) {
        console.log("Error in logout controller", error.message);
        res
        .status(500)
        .json({ error: "Internal server error" });
    }
}

export const getMe = async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findUnique({where: {
            id: req.user.id
        }})
        if (!user) {
            return res
            .status(404)
            .json({error: "User not found"});
        }
        res
        .status(200)
        .json({
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePic: user.profilePic
        })
    } catch (error: any) {
        console.log("Error in getMe controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}