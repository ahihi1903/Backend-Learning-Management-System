import createError from "../middlewares/createError.js";
import logger from "../utils/logger.js";
export default function role(...allowedRoles) {
  return function (req, res, next) {
    if (!req.user) {
      //throw createError(401, "Unauthorized");
      logger.warn(`Unauthorized access by ${req.user?.username}`);

      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      //throw createError(403, "Forbidden");
      logger.warn(`Forbidden access by ${req.user?.username}`);

      return res.status(403).json({
        message: "Forbidden",
      });
    }

    next();
  };
}
