// src/validations/lessonValidation.js
import { z } from "zod";

export const createLessonSchema = z.object({
  title: z.string().min(3, "Tiêu đề quá ngắn").max(100),
  content: z.string().optional(),
  videoUrl: z.string().url("URL không hợp lệ").optional(),
  video: z.object({
    publicId: z.string().min(1).max(300),
    playbackUrl: z.string().url(),
    originalUrl: z.string().url().optional(),
    duration: z.number().nonnegative().optional(),
    bytes: z.number().int().nonnegative().optional(),
    format: z.string().max(20).optional(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
  }).optional(),
  order: z.number().int().min(0).default(0),
});

export const updateLessonSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  content: z.string().optional(),
  videoUrl: z.string().url().nullable().optional(),
  video: z.object({
    publicId: z.string().min(1).max(300).nullable().optional(),
    playbackUrl: z.string().url().nullable().optional(),
    originalUrl: z.string().url().nullable().optional(),
    duration: z.number().nonnegative().nullable().optional(),
    bytes: z.number().int().nonnegative().nullable().optional(),
    format: z.string().max(20).nullable().optional(),
    width: z.number().int().positive().nullable().optional(),
    height: z.number().int().positive().nullable().optional(),
  }).optional(),
  order: z.number().int().min(0).optional(),
});
