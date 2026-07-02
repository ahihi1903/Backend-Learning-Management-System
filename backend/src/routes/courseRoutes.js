// src/routes/courseRoutes.js
import express from "express";
import auth from "../middlewares/auth.js";
import role from "../middlewares/role.js";
import validate from "../middlewares/validate.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import * as courseController from "../controllers/courseController.js";
import {
  createCourseSchema,
  updateCourseSchema,
} from "../validations/courseValidation.js";

const router = express.Router();

// public — ai cũng xem được
router.get("/", asyncHandler(courseController.getAll));
router.get("/:id", asyncHandler(courseController.getById));

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
  auth,
  role("teacher", "admin"),
  validate(updateCourseSchema),
  asyncHandler(courseController.update),
);

router.delete(
  "/:id",
  auth,
  role("teacher", "admin"),
  asyncHandler(courseController.remove),
);

export default router;
