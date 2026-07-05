import express from "express";
import auth from "../middlewares/auth.js";
import role from "../middlewares/role.js";
import validate from "../middlewares/validate.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { validateParams } from "../middlewares/validateRequest.js";
import {
  courseProgressParamSchema,
  lessonProgressParamSchema,
  updateProgressSchema,
  userProgressParamSchema,
} from "../validations/progressValidation.js";
import * as progressController from "../controllers/progressController.js";

const router = express.Router({ mergeParams: true });

router.get(
  "/me",
  validateParams(courseProgressParamSchema),
  auth,
  role("student"),
  asyncHandler(progressController.getMine),
);
router.put(
  "/lessons/:lessonId",
  validateParams(lessonProgressParamSchema),
  auth,
  role("student"),
  validate(updateProgressSchema),
  asyncHandler(progressController.update),
);
router.get(
  "/users/:userId",
  validateParams(userProgressParamSchema),
  auth,
  role("teacher", "admin"),
  asyncHandler(progressController.getStudent),
);

export default router;
