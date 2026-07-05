// src/routes/commentRoutes.js
import express from "express";
import auth from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import * as commentController from "../controllers/commentController.js";
import {
  createCommentSchema,
  updateCommentSchema,
} from "../validations/commentValidation.js";
import { validateParams } from "../middlewares/validateRequest.js";
import {
  lessonIdParamSchema,
  lessonItemParamSchema,
} from "../validations/commonValidation.js";

// ⭐ mergeParams: true — để đọc được :lessonId từ app.js
const router = express.Router({ mergeParams: true });

// public
router.get(
  "/",
  validateParams(lessonIdParamSchema),
  auth,
  asyncHandler(commentController.getAll),
);

// mọi user đã login — không giới hạn role
router.post(
  "/",
  validateParams(lessonIdParamSchema),
  auth,
  validate(createCommentSchema),
  asyncHandler(commentController.create),
);

router.put(
  "/:id",
  validateParams(lessonItemParamSchema),
  auth,
  validate(updateCommentSchema),
  asyncHandler(commentController.update),
);

router.delete(
  "/:id",
  validateParams(lessonItemParamSchema),
  auth,
  asyncHandler(commentController.remove),
);

export default router;
