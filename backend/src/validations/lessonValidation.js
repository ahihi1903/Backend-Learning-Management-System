// src/validations/lessonValidation.js
import { z } from "zod";

export const createLessonSchema = z.object({
  title: z.string().min(3, "Tiêu đề quá ngắn").max(100),
  content: z.string().optional(),
  videoUrl: z.string().url("URL không hợp lệ").optional(),
  order: z.number().int().min(0).default(0),
});

export const updateLessonSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  content: z.string().optional(),
  videoUrl: z.string().url().nullable().optional(),
  order: z.number().int().min(0).optional(),
});
