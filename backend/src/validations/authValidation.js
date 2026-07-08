import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .email("Email không hợp lệ")
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
  .max(72, "Mật khẩu không được vượt quá 72 ký tự")
  .regex(/[a-z]/, "Mật khẩu phải có chữ thường")
  .regex(/[A-Z]/, "Mật khẩu phải có chữ hoa")
  .regex(/[0-9]/, "Mật khẩu phải có chữ số");

export const registerSchema = z.object({
  username: z.string().trim().min(3).max(20),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Mật khẩu là bắt buộc"),
});

export const googleLoginSchema = z
  .object({
    credential: z.string().min(100, "Google credential không hợp lệ").optional(),
    code: z.string().min(20, "Google authorization code không hợp lệ").optional(),
  })
  .refine((data) => data.credential || data.code, {
    message: "Google credential hoặc authorization code là bắt buộc",
    path: ["credential"],
  });

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1).optional(),
});

export const emailSchemaBody = z.object({
  email: emailSchema,
});

export const verifyEmailSchema = z
  .object({
    email: emailSchema.optional(),
    token: z.string().trim().min(20, "Token xác minh không hợp lệ").optional(),
    // Giữ otp để tương thích tài khoản cũ nếu database còn token 6 số đã hash.
    otp: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "OTP phải gồm đúng 6 chữ số")
      .optional(),
  })
  .refine((data) => data.token || data.otp, {
    message: "Token xác minh là bắt buộc",
    path: ["token"],
  });

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token là bắt buộc"),
  newPassword: passwordSchema,
});
