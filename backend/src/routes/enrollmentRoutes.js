import express from "express";
import auth from "../middlewares/auth.js";
import role from "../middlewares/role.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { validateParams } from "../middlewares/validateRequest.js";
import { courseEnrollmentParamSchema } from "../validations/enrollmentValidation.js";
import * as enrollmentController from "../controllers/enrollmentController.js";

const router = express.Router({ mergeParams: true });

router.post(
  "/",
  validateParams(courseEnrollmentParamSchema),
  auth,
  role("student"),
  asyncHandler(enrollmentController.enroll),
);
router.get(
  "/me",
  validateParams(courseEnrollmentParamSchema),
  auth,
  role("student"),
  asyncHandler(enrollmentController.getMine),
);
router.delete(
  "/me",
  validateParams(courseEnrollmentParamSchema),
  auth,
  role("student"),
  asyncHandler(enrollmentController.removeMine),
);
router.get(
  "/",
  validateParams(courseEnrollmentParamSchema),
  auth,
  role("teacher", "admin"),
  asyncHandler(enrollmentController.list),
);

export default router;
