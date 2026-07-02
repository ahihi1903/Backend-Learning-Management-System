import express from "express";
import errorHandler from "./src/middlewares/errorHandler.js";
import cookieParser from "cookie-parser";
import categoryRoutes from "./src/routes/categoryRoutes.js";
import courseRoutes from "./src/routes/courseRoutes.js";
import lessonRoutes from "./src/routes/lessonRoutes.js";
import commentRoutes from "./src/routes/commentRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import morgan from "morgan";
import requestLogger from "./src/middlewares/requestLogger.js";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// app.js — thêm sau cors()
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use("/uploads", express.static(path.join(__dirname, "src/uploads")));

app.use(cookieParser());
app.use(requestLogger);
//thay parseBody
app.use(express.json());

app.use(morgan("dev"));

//routes
app.use("/api/categories", categoryRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/courses/:courseId/lessons", lessonRoutes);
app.use("/api/lessons/:lessonId/comments", commentRoutes);
app.use("/api/users", userRoutes);

app.use(errorHandler);

export default app;
