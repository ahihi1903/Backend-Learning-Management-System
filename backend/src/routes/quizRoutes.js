import express from "express";
import auth from "../middlewares/auth.js";
import role from "../middlewares/role.js";
import validate from "../middlewares/validate.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { validateParams } from "../middlewares/validateRequest.js";
import {
  createQuizSchema,
  quizItemParamSchema,
  quizLessonParamSchema,
  submitQuizSchema,
  updateQuizSchema,
} from "../validations/quizValidation.js";
import * as quizController from "../controllers/quizController.js";

const router = express.Router({ mergeParams: true });

router.get(
  "/",
  validateParams(quizLessonParamSchema),
  auth,
  asyncHandler(quizController.list),
);
router.get(
  "/:quizId",
  validateParams(quizItemParamSchema),
  auth,
  asyncHandler(quizController.getById),
);
router.post(
  "/",
  validateParams(quizLessonParamSchema),
  auth,
  role("teacher", "admin"),
  validate(createQuizSchema),
  asyncHandler(quizController.create),
);
router.put(
  "/:quizId",
  validateParams(quizItemParamSchema),
  auth,
  role("teacher", "admin"),
  validate(updateQuizSchema),
  asyncHandler(quizController.update),
);
router.delete(
  "/:quizId",
  validateParams(quizItemParamSchema),
  auth,
  role("teacher", "admin"),
  asyncHandler(quizController.remove),
);
router.post(
  "/:quizId/submit",
  validateParams(quizItemParamSchema),
  auth,
  role("student"),
  validate(submitQuizSchema),
  asyncHandler(quizController.submit),
);
router.get(
  "/:quizId/attempts/me",
  validateParams(quizItemParamSchema),
  auth,
  role("student"),
  asyncHandler(quizController.myAttempts),
);

export default router;
