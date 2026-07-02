import logger from "../utils/logger.js";

export default function requestLogger(req, _res, next) {
  logger.info({
    method: req.method,
    url: req.originalUrl,
  });
  next();
}
