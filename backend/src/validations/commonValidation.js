import { z } from "zod";

export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "MongoDB ObjectId không hợp lệ");

export const idParamSchema = z.object({ id: objectIdSchema });
export const courseIdParamSchema = z.object({ courseId: objectIdSchema });
export const courseItemParamSchema = z.object({
  courseId: objectIdSchema,
  id: objectIdSchema,
});
export const lessonIdParamSchema = z.object({ lessonId: objectIdSchema });
export const lessonItemParamSchema = z.object({
  lessonId: objectIdSchema,
  id: objectIdSchema,
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(100).optional(),
});

export const courseQuerySchema = paginationQuerySchema.extend({
  category: objectIdSchema.optional(),
});

export const userQuerySchema = paginationQuerySchema.extend({
  role: z.enum(["admin", "teacher", "student"]).optional(),
});
