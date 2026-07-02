// src/validations/userValidation.js
import { z } from "zod";

export const updateUserSchema = z.object({
  username: z.string().min(3).max(20).optional(),
  email: z.string().email("Email không hợp lệ").optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, "Mật khẩu hiện tại quá ngắn"),
  newPassword: z.string().min(6, "Mật khẩu mới quá ngắn"),
});

export const updateRoleSchema = z.object({
  role: z.enum(["admin", "teacher", "student"], {
    errorMap: () => ({ message: "Role không hợp lệ" }),
  }),
});
