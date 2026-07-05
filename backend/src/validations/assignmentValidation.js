import { z } from "zod";
import { objectIdSchema } from "./commonValidation.js";

export const createAssignmentSchema = z.object({
  title: z.string().trim().min(3).max(150),
  instructions: z.string().trim().min(10).max(10_000),
  dueDate: z.coerce.date().nullable().optional(),
  maxScore: z.number().min(1).max(1000).default(100),
  isPublished: z.boolean().default(false),
});

export const updateAssignmentSchema = z
  .object({
    title: z.string().trim().min(3).max(150).optional(),
    instructions: z.string().trim().min(10).max(10_000).optional(),
    dueDate: z.coerce.date().nullable().optional(),
    maxScore: z.number().min(1).max(1000).optional(),
    isPublished: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, "Không có dữ liệu cập nhật");

export const submitAssignmentSchema = z
  .object({
    content: z.string().trim().max(20_000).optional(),
    fileUrl: z.string().url().nullable().optional(),
  })
  .refine((data) => data.content || data.fileUrl, "Cần content hoặc fileUrl");

export const gradeSubmissionSchema = z.object({
  score: z.number().min(0),
  feedback: z.string().trim().max(5000).optional(),
});

export const assignmentLessonParamSchema = z.object({
  lessonId: objectIdSchema,
});
export const assignmentItemParamSchema = z.object({
  lessonId: objectIdSchema,
  assignmentId: objectIdSchema,
});
export const submissionItemParamSchema = z.object({
  lessonId: objectIdSchema,
  assignmentId: objectIdSchema,
  submissionId: objectIdSchema,
});
