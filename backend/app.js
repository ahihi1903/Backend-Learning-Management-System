import express from "express";
import errorHandler from "./src/middlewares/errorHandler.js";
import cookieParser from "cookie-parser";
import categoryRoutes from "./src/routes/categoryRoutes.js";
import courseRoutes from "./src/routes/courseRoutes.js";
import lessonRoutes from "./src/routes/lessonRoutes.js";
import commentRoutes from "./src/routes/commentRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import enrollmentRoutes from "./src/routes/enrollmentRoutes.js";
import progressRoutes from "./src/routes/progressRoutes.js";
import quizRoutes from "./src/routes/quizRoutes.js";
import assignmentRoutes from "./src/routes/assignmentRoutes.js";
import healthRoutes from "./src/routes/healthRoutes.js";
import mediaRoutes from "./src/routes/mediaRoutes.js";
import morgan from "morgan";
import requestLogger from "./src/middlewares/requestLogger.js";
import cors from "cors";
import securityHeaders from "./src/middlewares/securityHeaders.js";
import rateLimit from "./src/middlewares/rateLimit.js";
import requestId from "./src/middlewares/requestId.js";

const app = express();
app.disable("x-powered-by");

if (process.env.TRUST_PROXY === "true") app.set("trust proxy", 1);

app.use(requestId);
app.use(securityHeaders);
app.use("/health", healthRoutes);
app.use(rateLimit({ windowMs: 60_000, max: 200 }));

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
app.use(express.json({ limit: "100kb" }));

app.use(morgan("dev"));

//routes
app.use("/api/auth", authRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/categories", categoryRoutes);// loại 
app.use("/api/courses", courseRoutes);     // khóa học
app.use("/api/courses/:courseId/enrollments", enrollmentRoutes);
app.use("/api/courses/:courseId/progress", progressRoutes);
app.use("/api/courses/:courseId/lessons", lessonRoutes);
app.use("/api/lessons/:lessonId/comments", commentRoutes);
app.use("/api/lessons/:lessonId/quizzes", quizRoutes);
app.use("/api/lessons/:lessonId/assignments", assignmentRoutes);
app.use("/api/users", userRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found", requestId: req.id });
});

app.use(errorHandler);

export default app;
