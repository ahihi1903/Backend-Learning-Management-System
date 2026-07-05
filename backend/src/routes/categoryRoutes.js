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
import { validateParams } from "../middlewares/validateRequest.js";
import { idParamSchema } from "../validations/commonValidation.js";

const router = express.Router();

// public
router.get("/", asyncHandler(categoryController.getAll));
router.get("/:id", validateParams(idParamSchema), asyncHandler(categoryController.getById));

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
  validateParams(idParamSchema),
  auth,
  role("admin"),
  validate(updateCategorySchema),
  asyncHandler(categoryController.update),
);

router.delete(
  "/:id",
  validateParams(idParamSchema),
  auth,
  role("admin"),
  asyncHandler(categoryController.remove),
);

export default router;
