import express, { Request, Response } from "express";
import { calculateStreak, createHabit, deleteHabit, getHabitById, getHabitLogs, getHabits, trackHabit, updateHabit, deleteHabitLog } from "../controllers/habit.controller";

const router = express.Router();

router.get("/habits", getHabits);
router.post("/habits", createHabit);
router.get("/habits/:id", getHabitById);
router.put("/habits/:id", updateHabit);
router.delete('/habits/:id', deleteHabit);
// Habit logs
router.post('/habits/:id/log', trackHabit);
router.get('/habits/:id/logs', getHabitLogs);
router.delete('/habits/:habitId/log/:logId', deleteHabitLog);
router.get('/habits/:id/streak', calculateStreak);

export default router;