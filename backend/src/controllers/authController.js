import * as authService from "../services/authService.js";

const REFRESH_COOKIE = "refreshToken";

function refreshCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    // Frontend (Vercel) và backend thường ở hai domain khác nhau khi deploy.
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  };
}

function getRefreshToken(req) {
  return req.cookies?.[REFRESH_COOKIE] || req.body?.refreshToken;
}

export async function register(req, res) {
  const result = await authService.register(req.body);
  res.status(201).json({
    message: "Đăng ký thành công. Vui lòng xác thực email.",
    ...result,
  });
}

export async function verifyEmail(req, res) {
  const user = await authService.verifyEmail(req.body.token);
  res.json({ message: "Xác thực email thành công", user });
}

export async function resendVerification(req, res) {
  const result = await authService.resendVerification(req.body.email);
  res.json({
    message: "Nếu tài khoản tồn tại và chưa xác thực, email mới đã được gửi.",
    ...result,
  });
}

export async function login(req, res) {
  const result = await authService.login(req.body.email, req.body.password);
  res.cookie(REFRESH_COOKIE, result.refreshToken, refreshCookieOptions());
  res.json({ accessToken: result.accessToken, user: result.user });
}

export async function refresh(req, res) {
  const rawRefreshToken = getRefreshToken(req);
  if (!rawRefreshToken) {
    return res.status(401).json({ message: "Refresh token là bắt buộc" });
  }

  const result = await authService.rotateRefreshToken(rawRefreshToken);
  res.cookie(REFRESH_COOKIE, result.refreshToken, refreshCookieOptions());
  res.json({ accessToken: result.accessToken });
}

export async function logout(req, res) {
  await authService.logout(getRefreshToken(req));
  res.clearCookie(REFRESH_COOKIE, {
    ...refreshCookieOptions(),
    maxAge: undefined,
  });
  res.json({ message: "Đăng xuất thành công" });
}

export async function forgotPassword(req, res) {
  const result = await authService.forgotPassword(req.body.email);
  res.json({
    message: "Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi.",
    ...result,
  });
}

export async function resetPassword(req, res) {
  await authService.resetPassword(req.body.token, req.body.newPassword);
  res.clearCookie(REFRESH_COOKIE, {
    ...refreshCookieOptions(),
    maxAge: undefined,
  });
  res.json({ message: "Đặt lại mật khẩu thành công" });
}
