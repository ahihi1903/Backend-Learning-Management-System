// src/validations/courseValidation.js
import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().min(3, "Tiêu đề quá ngắn").max(100),
  description: z.string().min(10, "Mô tả quá ngắn"),
  category: z.string().length(24, "Category ID không hợp lệ"),
  price: z.number().min(0).default(0),
});

export const updateCourseSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().min(10).optional(),
  category: z.string().length(24).optional(),
  price: z.number().min(0).optional(),
  isPublished: z.boolean().optional(),
});
