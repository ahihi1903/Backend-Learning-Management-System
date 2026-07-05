import express from "express";
import auth from "../middlewares/auth.js";
import role from "../middlewares/role.js";
import validate from "../middlewares/validate.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { validateParams } from "../middlewares/validateRequest.js";
import {
  assignmentItemParamSchema,
  assignmentLessonParamSchema,
  createAssignmentSchema,
  gradeSubmissionSchema,
  submissionItemParamSchema,
  submitAssignmentSchema,
  updateAssignmentSchema,
} from "../validations/assignmentValidation.js";
import * as assignmentController from "../controllers/assignmentController.js";

const router = express.Router({ mergeParams: true });

router.get(
  "/",
  validateParams(assignmentLessonParamSchema),
  auth,
  asyncHandler(assignmentController.list),
);
router.get(
  "/:assignmentId",
  validateParams(assignmentItemParamSchema),
  auth,
  asyncHandler(assignmentController.getById),
);
router.post(
  "/",
  validateParams(assignmentLessonParamSchema),
  auth,
  role("teacher", "admin"),
  validate(createAssignmentSchema),
  asyncHandler(assignmentController.create),
);
router.put(
  "/:assignmentId",
  validateParams(assignmentItemParamSchema),
  auth,
  role("teacher", "admin"),
  validate(updateAssignmentSchema),
  asyncHandler(assignmentController.update),
);
router.delete(
  "/:assignmentId",
  validateParams(assignmentItemParamSchema),
  auth,
  role("teacher", "admin"),
  asyncHandler(assignmentController.remove),
);
router.post(
  "/:assignmentId/submissions",
  validateParams(assignmentItemParamSchema),
  auth,
  role("student"),
  validate(submitAssignmentSchema),
  asyncHandler(assignmentController.submit),
);
router.get(
  "/:assignmentId/submissions/me",
  validateParams(assignmentItemParamSchema),
  auth,
  role("student"),
  asyncHandler(assignmentController.mySubmission),
);
router.get(
  "/:assignmentId/submissions",
  validateParams(assignmentItemParamSchema),
  auth,
  role("teacher", "admin"),
  asyncHandler(assignmentController.listSubmissions),
);
router.patch(
  "/:assignmentId/submissions/:submissionId/grade",
  validateParams(submissionItemParamSchema),
  auth,
  role("teacher", "admin"),
  validate(gradeSubmissionSchema),
  asyncHandler(assignmentController.grade),
);

export default router;
