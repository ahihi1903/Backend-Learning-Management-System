// src/routes/courseRoutes.js
import express from "express";
import auth from "../middlewares/auth.js";
import optionalAuth from "../middlewares/optionalAuth.js";
import role from "../middlewares/role.js";
import validate from "../middlewares/validate.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import * as courseController from "../controllers/courseController.js";
import {
  createCourseSchema,
  updateCourseSchema,
} from "../validations/courseValidation.js";
import { validateParams, validateQuery } from "../middlewares/validateRequest.js";
import {
  courseQuerySchema,
  idParamSchema,
} from "../validations/commonValidation.js";

const router = express.Router();

// public — ai cũng xem được
router.get("/", validateQuery(courseQuerySchema), asyncHandler(courseController.getAll));
router.get(
  "/:id",
  validateParams(idParamSchema),
  optionalAuth,
  asyncHandler(courseController.getById),
);

// teacher xem course của mình
router.get(
  "/my/courses",
  auth,
  role("teacher", "admin"),
  asyncHandler(courseController.getMyCourses),
);

// teacher + admin tạo course
router.post(
  "/",
  auth,
  role("teacher", "admin"),
  validate(createCourseSchema),
  asyncHandler(courseController.create),
);

// sửa + xóa: ownership check nằm trong service
router.put(
  "/:id",
  validateParams(idParamSchema),
  auth,
  role("teacher", "admin"),
  validate(updateCourseSchema),
  asyncHandler(courseController.update),
);

router.delete(
  "/:id",
  validateParams(idParamSchema),
  auth,
  role("teacher", "admin"),
  asyncHandler(courseController.remove),
);

export default router;
