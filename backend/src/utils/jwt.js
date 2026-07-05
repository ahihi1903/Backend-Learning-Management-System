import jwt from "jsonwebtoken";
import crypto from "crypto";

//const SECRET = process.env.JWT_SECRET; //khóa bí mật(secret) cua tôi
//console.log("JWT_SECRET =", process.env.JWT_SECRET);
// -> gọi process.env.JWT_SECRET trước sẽ khiến server chưa load kịp .env nên
// const SECRET = process.env.JWT_SECRET === undefire --> lỗi
export function generateAccessToken(user) {
  //create token

  return jwt.sign(
    //payload:tải trọng
    { id: user.id, username: user.username, role: user.role },
    //secret:bảo mật
    process.env.JWT_ACCESS_SECRET,
    //option:lựa chọn 1h
    { expiresIn: process.env.JWT_EXPIRES_IN || "15m" },
  );
}

export function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id, jti: crypto.randomUUID() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }, //7d
  );
}

export function verifyToken(token) {
  // xác minh token
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    return {
      error: true,
      message: error.message,
    };
  }
}

export function verifyRefreshToken(token) {
  // xác minh token
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    // return {
    //   error: true,
    //   message: error.message,
    // };
    return null;
  }
}
