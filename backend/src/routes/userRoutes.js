// src/routes/userRoutes.js
import express from "express";
import auth from "../middlewares/auth.js";
import role from "../middlewares/role.js";
import validate from "../middlewares/validate.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import * as userController from "../controllers/userController.js";
import {
  updateUserSchema,
  changePasswordSchema,
  updateRoleSchema,
} from "../validations/userValidation.js";

const router = express.Router();

// ⭐ Route cụ thể phải đặt TRƯỚC route có :id
// Nếu /me đặt sau /:id → Express hiểu "me" là một id → lỗi

// Profile của chính mình
router.get("/me", auth, asyncHandler(userController.getMe));

// Đổi mật khẩu
router.put(
  "/me/change-password",
  auth,
  validate(changePasswordSchema),
  asyncHandler(userController.changePassword),
);

// Danh sách user — admin only
router.get("/", auth, role("admin"), asyncHandler(userController.getAll));

// Chi tiết user — admin hoặc chính mình (check trong service)
router.get("/:id", auth, asyncHandler(userController.getById));

// Sửa thông tin — admin hoặc chính mình
router.put(
  "/:id",
  auth,
  validate(updateUserSchema),
  asyncHandler(userController.update),
);

// Đổi role — admin only
router.patch(
  "/:id/role",
  auth,
  role("admin"),
  validate(updateRoleSchema),
  asyncHandler(userController.updateRole),
);

// Xóa user — admin hoặc chính mình
router.delete("/:id", auth, asyncHandler(userController.remove));

export default router;
