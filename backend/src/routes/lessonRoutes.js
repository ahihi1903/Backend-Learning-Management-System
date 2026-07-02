// src/routes/lessonRoutes.js
import express from "express";
import auth from "../middlewares/auth.js";
import role from "../middlewares/role.js";
import validate from "../middlewares/validate.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import * as lessonController from "../controllers/lessonController.js";
import {
  createLessonSchema,
  updateLessonSchema,
} from "../validations/lessonValidation.js";

// ⭐ mergeParams: true — để đọc được :courseId từ app.js
const router = express.Router({ mergeParams: true });

// public
router.get("/", asyncHandler(lessonController.getAll));
router.get("/:id", asyncHandler(lessonController.getById));

// teacher/admin — ownership check nằm trong service
router.post(
  "/",
  auth,
  role("teacher", "admin"),
  validate(createLessonSchema),
  asyncHandler(lessonController.create),
);

router.put(
  "/:id",
  auth,
  role("teacher", "admin"),
  validate(updateLessonSchema),
  asyncHandler(lessonController.update),
);

router.delete(
  "/:id",
  auth,
  role("teacher", "admin"),
  asyncHandler(lessonController.remove),
);

export default router;
