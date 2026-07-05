import logger from "../utils/logger.js";

export default function errorHandler(err, req, res, next) {
  logger.error({
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    message: err.message,
    stack: err.stack,
  });

  let status = err.status || 500;
  let message = err.message || "Internal Server Error";

  if (err.name === "CastError") {
    status = 400;
    message = `${err.path} không hợp lệ`;
  }

  if (err.code === 11000) {
    status = 409;
    message = "Dữ liệu đã tồn tại";
  }

  if (status >= 500 && process.env.NODE_ENV === "production") {
    message = "Internal Server Error";
  }

  res.status(status).json({
    message,
    requestId: req.id,
  });
}
