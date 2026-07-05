import { verifyToken } from "../utils/jwt.js";
import User from "../models/User.js";

export default async function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return next();

  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization header không hợp lệ" });
  }

  const payload = verifyToken(header.slice(7));
  if (!payload || payload.error) {
    return res.status(401).json({ message: "Invalid token" });
  }

  try {
    const user = await User.findById(payload.id).select(
      "username role isVerified",
    );
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      isVerified: user.isVerified,
    };
    next();
  } catch (error) {
    next(error);
  }
}
