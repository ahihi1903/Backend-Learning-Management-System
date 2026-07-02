import { ZodError } from "zod";

export default function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body); // ✅ không throw, trả về object

    if (!result.success) {
      return res.status(400).json({
        message: result.error.issues[0].message, // Zod v4 dùng .issues thay vì .errors
      });
    }

    req.body = result.data;
    next();
  };
}
