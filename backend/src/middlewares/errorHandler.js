import logger from "../utils/logger.js";

export default function errorHandler(err, req, res, next) {
  logger.error({
    method: req.method,
    url: req.originalUrl,
    message: err.message,
    stack: err.stack,
  });

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
}
