import { Request, Response } from "express";
import prisma from "../db/prisma";

// Get todos for user
export const getTodosByUser = async (req: Request, res: Response): Promise<Response | void> => {
const { userId } = req.params;
  try {
    const todos = await prisma.todo.findMany({
      where: { userId: parseInt(userId) },
      include: {
        category: true,
        subtasks: true,
      },
    });
    if (todos.length === 0) {
      res
      .status(200)
      .json({ error: "No todos found for given user." })
    } else {
      res
      .status(200)
      .json(todos);
    }
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching todos' });
  }
}

// Create new todo 
export const createTodo = async (req: Request, res: Response): Promise<Response | void> => {
  const { userId, title, description, categoryName, icon, dueDate } = req.body;

  try {
    // Find or create the category by name for the user
    let category = await prisma.category.findFirst({
      where: {
        name: categoryName,
        userId: userId, 
      },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: categoryName,
          userId: userId,
        },
      });
    }

    const newTodo = await prisma.todo.create({
      data: {
        userId,
        title,
        description,
        categoryId: category?.id,
        icon,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    res.status(201).json(newTodo);
  } catch (error: any) {
    console.log("Error creating todo", error.message);
    res.status(500).json({ error: 'Error creating todo' });
  }
}

export const getTodoById = async (req: Request, res: Response): Promise<Response | void> => {
  const { id } = req.params;

  try {
    const todo = await prisma.todo.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        subtasks: true,
      },
    });

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.status(200).json(todo);
  } catch (error: any) {
    console.log("Error getting todo by ID", error.message);
    res.status(500).json({ error: 'Error fetching todo' });
  }
}

export const updateTodo = async (req: Request, res: Response): Promise<Response | void> => {
  const { id } = req.params;
  const { title, description, categoryId, icon, isCompleted } = req.body;

  try {
    const updatedTodo = await prisma.todo.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        categoryId,
        icon,
        isCompleted,
        completedAt: isCompleted ? new Date() : null, // Set completedAt if completed
      },
    });

    res.status(200).json(updatedTodo);
  } catch (error: any) {
    console.error("Error updating todo", error.message);
    res.status(500).json({ error: 'Error updating todo' });
  }
}

export const deleteTodo = async (req: Request, res: Response): Promise<Response | void> => {
  const { id } = req.params;

  try {
    await prisma.todo.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send(); // No content
  } catch (error: any) {
    console.log("Error deleting todo: ", error.message);
    res.status(500).json({ error: 'Error deleting todo' });
  }
}

export const completeTodo = async (req: Request, res: Response): Promise<Response | void> => {
  const { id } = req.params;

  try {
    const completedTodo = await prisma.todo.update({
      where: { id: parseInt(id) },
      data: {
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    res.status(200).json(completedTodo);
  } catch (error: any) {
    console.log("Error marking todo as completed: ", error.message);
    res.status(500).json({ error: 'Error completing todo' });
  }
}

export const getTodosByCategory = async (req: Request, res: Response): Promise<Response | void> => {
  const { categoryId } = req.params;

  try {
    const todos = await prisma.todo.findMany({
      where: {
        categoryId: parseInt(categoryId),
      },
      include: {
        category: true,
        subtasks: true 
      },
    });

    if (!todos.length) {
      return res.status(404).json({ error: 'No todos found for this category' });
    }

    res.status(200).json(todos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching todos by category' });
  }
}

// Subtask controllers

export const getSubtasksOnTodo = async (req: Request, res: Response): Promise<Response | void> => {
  const { todoId } = req.params;

  try {
    const todo = await prisma.todo.findUnique({
      where: { id: parseInt(todoId) },
      include: { subtasks: true }, 
    });

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    if (todo.subtasks.length === 0) {
      res.status(200).json({message: "No subtasks on task"})
    } else {
      res.status(200).json(todo.subtasks);
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching subtasks' });
  }
}

export const createSubtasksOnTodo = async (req: Request, res: Response): Promise<Response | void> => {
  const { todoId } = req.params;
  const { title, isCompleted } = req.body;

  try {
    const todo = await prisma.todo.findUnique({
      where: { id: parseInt(todoId) },
    });

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const subtask = await prisma.subTask.create({
      data: {
        title,
        isCompleted: isCompleted || false, // Default to false if not provided
        todoId: parseInt(todoId),
      },
    });

    res.status(201).json(subtask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating subtask' });
  }
}

export const updateSubtask = async (req: Request, res: Response): Promise<Response | void> => {
  const { todoId, subtaskId } = req.params;
  const { title, description } = req.body;

  try {
    // Ensure the parent todo exists
    const todo = await prisma.todo.findUnique({
      where: { id: parseInt(todoId) },
    });

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const updatedSubtask = await prisma.subTask.update({
      where: { id: parseInt(subtaskId) },
      data: {
        title,
        description
      },
    });

    res.status(200).json(updatedSubtask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating subtask' });
  }
}

export const deleteSubtask = async (req: Request, res: Response): Promise<Response | void> => {
  const { todoId, subtaskId } = req.params;

  try {
    // Ensure the parent todo exists
    const todo = await prisma.todo.findUnique({
      where: { id: parseInt(todoId) },
    });

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    await prisma.subTask.delete({
      where: { id: parseInt(subtaskId) },
    });

    res.status(200).json({ message: 'Subtask deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting subtask' });
  }
}

export const toggleSubtask = async (req: Request, res: Response): Promise<Response | void> => {
  const { todoId, subtaskId } = req.params;

  try {
    const todo = await prisma.todo.findUnique({
      where: { id: parseInt(todoId) },
    });

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const subtask = await prisma.subTask.findUnique({
      where: { id: parseInt(subtaskId) },
    });

    if (!subtask) {
      return res.status(404).json({ error: 'Subtask not found' });
    }

    const updatedSubtask = await prisma.subTask.update({
      where: { id: parseInt(subtaskId) },
      data: { isCompleted: !subtask.isCompleted },
    });

    res.status(200).json({
      message: `Subtask marked as ${updatedSubtask.isCompleted ? 'complete' : 'incomplete'}`,
      updatedSubtask,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error toggling subtask completion' });
  }
}