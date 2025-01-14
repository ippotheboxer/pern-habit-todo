import { Request, Response } from "express";
import prisma from "../db/prisma";

export const getHabits = async (req: Request, res: Response): Promise<Response | void> => {
    const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const habits = await prisma.habit.findMany({
      where: { userId: parseInt(userId as string) }, // Ensure user-specific filtering
    });
    if (habits.length === 0) {
        res.status(200).json({message: "No habits yet"});
    } else {
        res.status(200).json(habits);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching habits' });
  }
}

export const createHabit = async (req: Request, res: Response): Promise<Response | void> => {
    const { name, description, icon, userId, frequency, color } = req.body;

  try {
    const newHabit = await prisma.habit.create({
      data: {
        name,
        description,
        icon,
        userId,
        frequency,
        color
      },
    });

    res.status(201).json(newHabit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating habit' });
  }
}

export const getHabitById = async (req: Request, res: Response): Promise<Response | void> => {
    const { id } = req.params;

  try {
    const habit = await prisma.habit.findUnique({
      where: { id: parseInt(id) },
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    res.status(200).json(habit);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching habit' });
  }
}

export const updateHabit = async (req: Request, res: Response): Promise<Response | void> => {
    const { id } = req.params;
    const { name, description, icon, frequency, color } = req.body;

    try {
        const updatedHabit = await prisma.habit.update({
        where: { id: parseInt(id) },
        data: { name, description, icon, frequency },
    });
    res.status(200).json(updatedHabit);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating habit' });
  }
}

export const deleteHabit = async (req: Request, res: Response): Promise<Response | void> => {
    const { id } = req.params;
    try {
        await prisma.habit.delete({
        where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting habit' });
  }
}

// Habit logs

export const trackHabit = async (req: Request, res: Response): Promise<Response | void> => {
    const { id } = req.params;
    const { date } = req.body;

    try {
        const habit = await prisma.habit.findUnique({
        where: { id: parseInt(id) },
    });

    if (!habit) {
      return res
      .status(404)
      .json({ error: 'Habit not found' });
    }

    const habitLog = await prisma.habitLog.create({
      data: {
        habitId: habit.id,
        date: new Date(date),
        completed: true
      },
    });

    res.status(201).json(habitLog);
  } catch (error) {
    console.error(error);
    res
    .status(500)
    .json({ error: 'Error logging habit completion' });
  }
}

export const getHabitLogs = async (req: Request, res: Response): Promise<Response | void> => {
    const { id } = req.params;

    try {
        const logs = await prisma.habitLog.findMany({
            where: { habitId: parseInt(id) },
            orderBy: { date: 'asc' },
        });

        if (logs.length === 0) {
            res.status(200).json({message: "No logs for this habit"})
        } else {
            res.status(200).json(logs);
        }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching habit logs' });
  }
}

export const calculateStreak = async (req: Request, res: Response): Promise<Response | void> => {
    const { id } = req.params;

  try {
    const logs = await prisma.habitLog.findMany({
      where: { habitId: parseInt(id) },
      orderBy: { date: 'asc' },
    });

    if (!logs.length) {
      return res.status(200).json({ streak: 0 });
    }

    let streak = 0;
    let lastDate = new Date(logs[0].date);

    logs.forEach((log, index) => {
      const currentDate = new Date(log.date);

      if (index === 0 || currentDate.getTime() - lastDate.getTime() === 86400000) {
        streak++;
      } else if (currentDate.getTime() - lastDate.getTime() > 86400000) {
        streak = 1; // Reset streak if a day is skipped
      }

      lastDate = currentDate;
    });

    res.status(200).json({ streak });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error calculating streak' });
  }
}

export const deleteHabitLog = async (req: Request, res: Response): Promise<Response | void> => {
    const { habitId, logId } = req.params;

  try {
    const habit = await prisma.habit.findUnique({
      where: { id: parseInt(habitId) },
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    const deletedLog = await prisma.habitLog.delete({
      where: { id: parseInt(logId) },
    });

    res.status(200).json({ message: 'Habit log deleted successfully', deletedLog });
  } catch (error: any) {
    if (error.code === 'P2025') { // Prisma error code for record not found
        return res.status(404).json({ error: 'Log not found' });
      }
    console.error(error);
    res.status(500).json({ error: 'Error deleting habit log' });
  }
}