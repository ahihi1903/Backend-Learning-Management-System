// //xác thực
import { verifyToken } from "../utils/jwt.js";
import User from "../models/User.js";

// export default function auth(req, res, next) {
//   const header = req.headers.authorization;

//   if (!header) {
//     //throw createError(401, "No token");
//     return res.status(401).json({
//       message: "No token",
//     });
//   }

//   // const token = header.split(" ")[1];
//   const [scheme, token] = header?.split(" ") ?? [];

//   if (!token) {
//     //throw createError(402, "No token");
//     return res.status(402).json({
//       message: "No token",
//     });
//   }

//   if (scheme !== "Bearer" || !token) {
//     return res.status(401).json({
//       message: "Authorization header must use Bearer token",
//     });
//   }

//   const user = verifyToken(token);

//   if (!user || user.error) {
//     //throw createError(401, "Invalid token");
//     return res.status(401).json({
//       message: "Invalid token",
//     });
//   }

//   req.user = user;
//   next();
// }
export default async function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token" });
  }

  const token = header.split(" ")[1];
  const user = verifyToken(token);

  if (!user || user.error) {
    return res.status(401).json({ message: "Invalid token" });
  }

  try {
    const currentUser = await User.findById(user.id).select(
      "username role isVerified",
    );
    if (!currentUser) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = {
      id: currentUser.id,
      username: currentUser.username,
      role: currentUser.role,
      isVerified: currentUser.isVerified,
    };
    next();
  } catch (error) {
    next(error);
  }
}
