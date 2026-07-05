import express from "express";
import asyncHandler from "../middlewares/asyncHandler.js";
import validate from "../middlewares/validate.js";
import * as authController from "../controllers/authController.js";
import {
  emailSchemaBody,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../validations/authValidation.js";
import rateLimit from "../middlewares/rateLimit.js";

const router = express.Router();
const sensitiveAuthLimit = rateLimit({ windowMs: 15 * 60_000, max: 10 });

router.post(
  "/register",
  sensitiveAuthLimit,
  validate(registerSchema),
  asyncHandler(authController.register),
);
router.post(
  "/verify-email",
  validate(verifyEmailSchema),
  asyncHandler(authController.verifyEmail),
);
router.post(
  "/resend-verification",
  sensitiveAuthLimit,
  validate(emailSchemaBody),
  asyncHandler(authController.resendVerification),
);
router.post(
  "/login",
  sensitiveAuthLimit,
  validate(loginSchema),
  asyncHandler(authController.login),
);
router.post(
  "/refresh",
  validate(refreshTokenSchema),
  asyncHandler(authController.refresh),
);
router.post(
  "/logout",
  validate(refreshTokenSchema),
  asyncHandler(authController.logout),
);
router.post(
  "/forgot-password",
  sensitiveAuthLimit,
  validate(emailSchemaBody),
  asyncHandler(authController.forgotPassword),
);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  asyncHandler(authController.resetPassword),
);

export default router;
