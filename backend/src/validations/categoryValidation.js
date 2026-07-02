// src/validations/categoryValidation.js
import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2, "Tên quá ngắn").max(50, "Tên quá dài").trim(),
  description: z.string().max(200).optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2).max(50).trim().optional(),
  description: z.string().max(200).optional(),
});