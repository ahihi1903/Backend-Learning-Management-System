function validationError(res, error) {
  return res.status(400).json({
    message: error.issues[0]?.message || "Dữ liệu không hợp lệ",
  });
}

export function validateParams(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) return validationError(res, result.error);
    req.validatedParams = result.data;
    next();
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) return validationError(res, result.error);
    req.validatedQuery = result.data;
    next();
  };
}
