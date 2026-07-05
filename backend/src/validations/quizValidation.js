import { z } from "zod";
import { objectIdSchema } from "./commonValidation.js";

const questionSchema = z
  .object({
    text: z.string().trim().min(3).max(500),
    options: z.array(z.string().trim().min(1).max(300)).min(2).max(10),
    correctOption: z.number().int().min(0),
    points: z.number().int().min(1).max(100).default(1),
  })
  .refine((question) => question.correctOption < question.options.length, {
    message: "correctOption vượt quá số lượng options",
  });

export const createQuizSchema = z.object({
  title: z.string().trim().min(3).max(150),
  questions: z.array(questionSchema).min(1).max(100),
  passingScore: z.number().min(0).max(100).default(60),
  isPublished: z.boolean().default(false),
});

export const updateQuizSchema = z
  .object({
    title: z.string().trim().min(3).max(150).optional(),
    questions: z.array(questionSchema).min(1).max(100).optional(),
    passingScore: z.number().min(0).max(100).optional(),
    isPublished: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, "Không có dữ liệu cập nhật");

export const submitQuizSchema = z.object({
  answers: z.array(z.number().int().min(0)).min(1),
});

export const quizLessonParamSchema = z.object({ lessonId: objectIdSchema });
export const quizItemParamSchema = z.object({
  lessonId: objectIdSchema,
  quizId: objectIdSchema,
});
