// src/routes/categoryRoutes.js
import express from "express";
import auth from "../middlewares/auth.js";
import role from "../middlewares/role.js";
import validate from "../middlewares/validate.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import * as categoryController from "../controllers/categoryController.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../validations/categoryValidation.js";

const router = express.Router();

// public
router.get("/", asyncHandler(categoryController.getAll));
router.get("/:id", asyncHandler(categoryController.getById));

// admin only
router.post(
  "/",
  auth,
  role("admin"),
  validate(createCategorySchema),
  asyncHandler(categoryController.create),
);

router.put(
  "/:id",
  auth,
  role("admin"),
  validate(updateCategorySchema),
  asyncHandler(categoryController.update),
);

router.delete(
  "/:id",
  auth,
  role("admin"),
  asyncHandler(categoryController.remove),
);

export default router;
