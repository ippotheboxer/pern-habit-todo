import express, { Request, Response } from "express";

const router = express.Router();

router.get("/habits", (req: Request, res: Response) => {
    res.send("Habits");
})

export default router;