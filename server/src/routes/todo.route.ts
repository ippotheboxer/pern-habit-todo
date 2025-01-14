import express, { Request, Response } from "express";
import { getTodosByUser, createTodo, getTodoById, updateTodo, deleteTodo, completeTodo, getTodosByCategory } from "../controllers/todo.controller";


const router = express.Router();

router.get("/todos/user/:userId", getTodosByUser);
router.post("/todos", createTodo);
router.get("/todos/:id", getTodoById);
router.put("/todos/:id", updateTodo);
router.delete("/todos/:id", deleteTodo);
router.patch("/todos/:id/complete", completeTodo);
router.get("/todos/category/:categoryId", getTodosByCategory)

export default router;