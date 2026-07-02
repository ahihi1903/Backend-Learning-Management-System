// src/validations/commentValidation.js
import { z } from "zod";

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment không được rỗng")
    .max(500, "Comment quá dài"),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(500),
});
