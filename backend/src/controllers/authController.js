import * as authService from "../services/authService.js";

const REFRESH_COOKIE = "refreshToken";

function refreshCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  };
}

function getRefreshToken(req) {
  return req.cookies?.[REFRESH_COOKIE] || req.body?.refreshToken;
}

function setSessionCookie(res, refreshToken) {
  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
}

export async function register(req, res) {
  const result = await authService.register(req.body);
  res.status(201).json({
    message: "Đăng ký thành công. Link xác minh đang được gửi tới email của bạn.",
    ...result,
  });
}

export async function verifyEmail(req, res) {
  const user = await authService.verifyEmail(
    req.body.token || req.body.otp,
    req.body.email,
  );
  res.json({ message: "Xác minh email thành công", user });
}

export async function resendVerification(req, res) {
  const result = await authService.resendVerification(req.body.email);
  res.json({
    message:
      "Nếu tài khoản tồn tại và chưa xác minh, một link mới đang được gửi.",
    ...result,
  });
}

export async function login(req, res) {
  const result = await authService.login(req.body.email, req.body.password);
  setSessionCookie(res, result.refreshToken);
  res.json({ accessToken: result.accessToken, user: result.user });
}

export async function googleLogin(req, res) {
  const result = await authService.loginWithGoogle(req.body.credential);
  setSessionCookie(res, result.refreshToken);
  res.json({ accessToken: result.accessToken, user: result.user });
}

export async function refresh(req, res) {
  const rawRefreshToken = getRefreshToken(req);
  if (!rawRefreshToken) {
    return res.status(401).json({ message: "Refresh token là bắt buộc" });
  }

  const result = await authService.rotateRefreshToken(rawRefreshToken);
  setSessionCookie(res, result.refreshToken);
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
    message:
      "Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đang được gửi.",
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
