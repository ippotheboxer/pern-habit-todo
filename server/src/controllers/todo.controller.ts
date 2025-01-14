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
      },
    });
    if (todos.length === 0) {
      res.status(404).json({ error: "No todos found for given user." })
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
        userId: userId, // Ensure the category belongs to the user
      },
    });

    if (!category) {
      // If category doesn't exist, create it
      category = await prisma.category.create({
        data: {
          name: categoryName,
          userId: userId,
        },
      });
    }

    // Create the todo and associate it with the category
    const newTodo = await prisma.todo.create({
      data: {
        userId,
        title,
        description,
        categoryId: category?.id,
        icon,
        dueDate: dueDate ? new Date(dueDate) : null, // Parse dueDate if provided
      },
    });

    res
    .status(201)
    .json(newTodo);
  } catch (error: any) {
    console.log("Error creating todo", error.message);
    res
    .status(500)
    .json({ error: 'Error creating todo' });
  }
}

export const getTodoById = async (req: Request, res: Response): Promise<Response | void> => {
  const { id } = req.params;

  try {
    const todo = await prisma.todo.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true, // Include category details if needed
      },
    });

    if (!todo) {
      return res
      .status(404)
      .json({ error: 'Todo not found' });
    }

    res.status(200).json(todo);
  } catch (error: any) {
    console.log("Error getting todo by ID", error.message);
    res
    .status(500)
    .json({ error: 'Error fetching todo' });
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

    res
    .status(200)
    .json(updatedTodo);
  } catch (error: any) {
    console.error("Error updating todo", error.message);
    res
    .status(500)
    .json({ error: 'Error updating todo' });
  }
}
export const deleteTodo = async (req: Request, res: Response): Promise<Response | void> => {
  const { id } = req.params;

  try {
    await prisma.todo.delete({
      where: { id: parseInt(id) },
    });
    res
    .status(204)
    .send(); // No content
  } catch (error: any) {
    console.log("Error deleting todo: ", error.message);
    res
    .status(500)
    .json({ error: 'Error deleting todo' });
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

    res
    .status(200)
    .json(completedTodo);
  } catch (error: any) {
    console.log("Error marking todo as completed: ", error.message);
    res
    .status(500)
    .json({ error: 'Error completing todo' });
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
      },
    });

    if (!todos.length) {
      return res
      .status(404)
      .json({ error: 'No todos found for this category' });
    }

    res
    .status(200)
    .json(todos);
  } catch (error) {
    console.error(error);
    res
    .status(500)
    .json({ error: 'Error fetching todos by category' });
  }
}