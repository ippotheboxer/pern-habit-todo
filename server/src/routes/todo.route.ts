import express from "express";
import { getTodosByUser, createTodo, getTodoById, updateTodo, deleteTodo, completeTodo, getTodosByCategory, getSubtasksOnTodo, createSubtasksOnTodo, updateSubtask, deleteSubtask, toggleSubtask } from "../controllers/todo.controller";

const router = express.Router();

// todo routes
router.get("/todos/user/:userId", getTodosByUser);
router.post("/todos", createTodo);
router.get("/todos/:id", getTodoById);
router.put("/todos/:id", updateTodo);
router.delete("/todos/:id", deleteTodo);
router.patch("/todos/:id/complete", completeTodo);
router.get("/todos/category/:categoryId", getTodosByCategory);

// todo subtasks routes
router.get("/todos/:todoId/subtasks", getSubtasksOnTodo);
router.post("/todos/:todoId/subtasks", createSubtasksOnTodo);
router.put("/todos/:todoId/subtasks/:subtaskId", updateSubtask);
router.delete("/todos/:todoId/subtasks/:subtaskId", deleteSubtask);
router.patch("/todos/:todoId/subtasks/:subtaskId/toggle", toggleSubtask);

export default router;