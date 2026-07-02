import jwt from "jsonwebtoken";

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
    { expiresIn: "15m" },
  );
}

export function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }, //7d
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
