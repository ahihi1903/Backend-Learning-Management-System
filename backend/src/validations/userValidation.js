// src/validations/userValidation.js
import { z } from "zod";

export const updateUserSchema = z.object({
  username: z.string().min(3).max(20).optional(),
  email: z.string().email("Email không hợp lệ").optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Mật khẩu hiện tại là bắt buộc"),
  newPassword: z
    .string()
    .min(8, "Mật khẩu mới phải có ít nhất 8 ký tự")
    .max(72)
    .regex(/[a-z]/, "Mật khẩu mới phải có chữ thường")
    .regex(/[A-Z]/, "Mật khẩu mới phải có chữ hoa")
    .regex(/[0-9]/, "Mật khẩu mới phải có chữ số"),
});

export const updateRoleSchema = z.object({
  role: z.enum(["admin", "teacher", "student"], {
    errorMap: () => ({ message: "Role không hợp lệ" }),
  }),
});
