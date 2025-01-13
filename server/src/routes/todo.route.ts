import express, { Request, Response } from "express";

const router = express.Router();

router.get("/todos", (req: Request, res: Response) => {
    res.send("Todos");
})

export default router;