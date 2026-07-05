import crypto from "crypto";
import User from "../models/User.js";
import createError from "../middlewares/createError.js";
import { comparePassword, hashPassword } from "../utils/hash.js";
import { hashToken } from "../utils/hashToken.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { sendEmail } from "../utils/sendEmail.js";
import logger from "../utils/logger.js";

const VERIFY_TOKEN_TTL = 24 * 60 * 60 * 1000;
const RESET_TOKEN_TTL = 15 * 60 * 1000;

function createRandomToken() {
  return crypto.randomBytes(32).toString("hex");
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    avatar: user.avatar,
  };
}

function devToken(token) {
  return process.env.NODE_ENV === "production" ? undefined : token;
}

async function sendVerificationEmail(user, rawToken) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const verifyUrl = `${frontendUrl}/verify-email?token=${rawToken}`;

  try {
    await sendEmail(
      user.email,
      "Xác thực tài khoản LMS",
      `<p>Xin chào ${user.username},</p><p>Hãy xác thực tài khoản tại <a href="${verifyUrl}">${verifyUrl}</a>. Link có hiệu lực trong 24 giờ.</p>`,
    );
    return true;
  } catch (error) {
    logger.error({
      event: "verification_email_failed",
      userId: user.id,
      message: error.message,
    });
    return false;
  }
}

export async function register(data) {
  const exists = await User.findOne({
    $or: [{ email: data.email }, { username: data.username }],
  });
  if (exists) throw createError(409, "Email hoặc username đã tồn tại");

  const rawVerifyToken = createRandomToken();
  const user = await User.create({
    username: data.username,
    email: data.email,
    password: await hashPassword(data.password),
    role: "student",
    verifyToken: hashToken(rawVerifyToken),
    verifyTokenExpire: new Date(Date.now() + VERIFY_TOKEN_TTL),
  });

  const emailSent = await sendVerificationEmail(user, rawVerifyToken);
  return {
    user: publicUser(user),
    emailSent,
    verificationToken: devToken(rawVerifyToken),
  };
}

export async function verifyEmail(rawToken) {
  const user = await User.findOne({
    verifyToken: hashToken(rawToken),
    verifyTokenExpire: { $gt: new Date() },
  }).select("+verifyToken +verifyTokenExpire");

  if (!user) throw createError(400, "Verification token không hợp lệ hoặc đã hết hạn");

  user.isVerified = true;
  user.verifyToken = undefined;
  user.verifyTokenExpire = undefined;
  await user.save();
  return publicUser(user);
}

export async function resendVerification(email) {
  const user = await User.findOne({ email }).select(
    "+verifyToken +verifyTokenExpire",
  );

  // Cùng một response cho email tồn tại/không tồn tại để tránh dò tài khoản.
  if (!user || user.isVerified) return {};

  const rawVerifyToken = createRandomToken();
  user.verifyToken = hashToken(rawVerifyToken);
  user.verifyTokenExpire = new Date(Date.now() + VERIFY_TOKEN_TTL);
  await user.save();

  await sendVerificationEmail(user, rawVerifyToken);
  return { verificationToken: devToken(rawVerifyToken) };
}

export async function login(email, password) {
  const user = await User.findOne({ email }).select("+password +refreshToken");
  if (!user || !(await comparePassword(password, user.password))) {
    throw createError(401, "Email hoặc mật khẩu không đúng");
  }
  if (!user.isVerified) {
    throw createError(403, "Tài khoản chưa được xác thực");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refreshToken = hashToken(refreshToken);
  await user.save();
  return { accessToken, refreshToken, user: publicUser(user) };
}

export async function rotateRefreshToken(rawRefreshToken) {
  const payload = verifyRefreshToken(rawRefreshToken);
  if (!payload?.id) throw createError(401, "Refresh token không hợp lệ");

  const user = await User.findById(payload.id).select("+refreshToken");
  if (!user || !user.refreshToken) {
    throw createError(401, "Refresh token không hợp lệ");
  }

  if (user.refreshToken !== hashToken(rawRefreshToken)) {
    user.refreshToken = null;
    await user.save();
    throw createError(401, "Refresh token đã bị thu hồi");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refreshToken = hashToken(refreshToken);
  await user.save();
  return { accessToken, refreshToken };
}

export async function logout(rawRefreshToken) {
  if (!rawRefreshToken) return;

  const payload = verifyRefreshToken(rawRefreshToken);
  if (!payload?.id) return;

  await User.updateOne(
    { _id: payload.id, refreshToken: hashToken(rawRefreshToken) },
    { $set: { refreshToken: null } },
  );
}

export async function forgotPassword(email) {
  const user = await User.findOne({ email }).select(
    "+resetPasswordToken +resetPasswordExpire",
  );
  if (!user) return {};

  const rawResetToken = createRandomToken();
  user.resetPasswordToken = hashToken(rawResetToken);
  user.resetPasswordExpire = new Date(Date.now() + RESET_TOKEN_TTL);
  await user.save();

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetUrl = `${frontendUrl}/reset-password?token=${rawResetToken}`;

  try {
    await sendEmail(
      user.email,
      "Đặt lại mật khẩu LMS",
      `<p>Đặt lại mật khẩu tại <a href="${resetUrl}">${resetUrl}</a>. Link có hiệu lực trong 15 phút.</p>`,
    );
  } catch (error) {
    logger.error({
      event: "reset_password_email_failed",
      userId: user.id,
      message: error.message,
    });
  }

  return { resetToken: devToken(rawResetToken) };
}

export async function resetPassword(rawToken, newPassword) {
  const user = await User.findOne({
    resetPasswordToken: hashToken(rawToken),
    resetPasswordExpire: { $gt: new Date() },
  }).select(
    "+password +refreshToken +resetPasswordToken +resetPasswordExpire",
  );

  if (!user) throw createError(400, "Reset token không hợp lệ hoặc đã hết hạn");

  user.password = await hashPassword(newPassword);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.refreshToken = null;
  await user.save();
}
