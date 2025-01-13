import express, { Express } from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route";
import todoRoutes from "./routes/todo.route";
import habitRoutes from "./routes/habit.route";

import { PORT } from "./constants/index";

const app: Express = express();
const port = PORT || 5000;

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/todo", todoRoutes);
app.use("/api/habit", habitRoutes);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});