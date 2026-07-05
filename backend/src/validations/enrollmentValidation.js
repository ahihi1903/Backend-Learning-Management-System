import { z } from "zod";
import { objectIdSchema } from "./commonValidation.js";

export const courseEnrollmentParamSchema = z.object({
  courseId: objectIdSchema,
});
