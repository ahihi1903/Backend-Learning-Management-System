import { z } from "zod";
import { objectIdSchema } from "./commonValidation.js";

export const courseProgressParamSchema = z.object({
  courseId: objectIdSchema,
});

export const lessonProgressParamSchema = z.object({
  courseId: objectIdSchema,
  lessonId: objectIdSchema,
});

export const userProgressParamSchema = z.object({
  courseId: objectIdSchema,
  userId: objectIdSchema,
});

export const updateProgressSchema = z
  .object({
    completed: z.boolean().optional(),
    lastPositionSeconds: z.number().min(0).max(24 * 60 * 60).optional(),
  })
  .refine(
    (data) => data.completed !== undefined || data.lastPositionSeconds !== undefined,
    "Cần ít nhất một trường progress",
  );
