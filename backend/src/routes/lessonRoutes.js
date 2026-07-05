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
import { validateParams } from "../middlewares/validateRequest.js";
import {
  courseIdParamSchema,
  courseItemParamSchema,
} from "../validations/commonValidation.js";

// ⭐ mergeParams: true — để đọc được :courseId từ app.js
const router = express.Router({ mergeParams: true });

// public
router.get(
  "/",
  validateParams(courseIdParamSchema),
  auth,
  asyncHandler(lessonController.getAll),
);
router.get(
  "/:id",
  validateParams(courseItemParamSchema),
  auth,
  asyncHandler(lessonController.getById),
);

// teacher/admin — ownership check nằm trong service
router.post(
  "/",
  validateParams(courseIdParamSchema),
  auth,
  role("teacher", "admin"),
  validate(createLessonSchema),
  asyncHandler(lessonController.create),
);

router.put(
  "/:id",
  validateParams(courseItemParamSchema),
  auth,
  role("teacher", "admin"),
  validate(updateLessonSchema),
  asyncHandler(lessonController.update),
);

router.delete(
  "/:id",
  validateParams(courseItemParamSchema),
  auth,
  role("teacher", "admin"),
  asyncHandler(lessonController.remove),
);

export default router;
