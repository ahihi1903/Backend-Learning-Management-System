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

// ⭐ mergeParams: true — để đọc được :lessonId từ app.js
const router = express.Router({ mergeParams: true });

// public
router.get("/", asyncHandler(commentController.getAll));

// mọi user đã login — không giới hạn role
router.post(
  "/",
  auth,
  validate(createCommentSchema),
  asyncHandler(commentController.create),
);

router.put(
  "/:id",
  auth,
  validate(updateCommentSchema),
  asyncHandler(commentController.update),
);

router.delete("/:id", auth, asyncHandler(commentController.remove));

export default router;
