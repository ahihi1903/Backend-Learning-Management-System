import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
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
const VERIFY_TOKEN_COOLDOWN = 60 * 1000;
const VERIFY_TOKEN_MAX_ATTEMPTS = 5;
const RESET_TOKEN_TTL = 15 * 60 * 1000;
const googleClient = new OAuth2Client();

function createRandomToken() {
  return crypto.randomBytes(32).toString("hex");
}

function userId(user) {
  return String(user.id || user._id);
}

function publicUser(user) {
  return {
    id: userId(user),
    username: user.username,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    avatar: user.avatar,
    authProvider: user.authProvider,
  };
}

function tokenUser(user) {
  return {
    id: userId(user),
    username: user.username,
    email: user.email,
    role: user.role,
  };
}

function devValue(value) {
  return process.env.NODE_ENV === "production" ? undefined : value;
}

function frontendUrl() {
  return (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
}

function verificationLink(user, rawToken) {
  const params = new URLSearchParams({
    token: rawToken,
    email: user.email,
  });
  return `${frontendUrl()}/verify-email?${params.toString()}`;
}

function logEmailFailure(error, context) {
  logger.error({
    event: "email_send_failed",
    ...context,
    message: error.message,
    provider: error.provider,
    status: error.status,
    code: error.code,
    command: error.command,
    responseCode: error.responseCode,
    response: error.response,
  });
}

function emailUnavailableError(message = "Không thể gửi email. Vui lòng thử lại sau") {
  return createError(503, message, { expose: true });
}

function verificationEmailHtml(user, link) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#18181b">
      <p>Xin chào ${user.username},</p>
      <h2 style="margin-bottom:8px">Xác minh tài khoản Northstar</h2>
      <p>Bấm nút bên dưới để hoàn tất đăng ký. Liên kết có hiệu lực trong 24 giờ.</p>
      <p style="margin:28px 0">
        <a href="${link}" style="display:inline-block;background:#10b981;color:white;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:12px">
          Xác minh tài khoản
        </a>
      </p>
      <p style="color:#71717a">Nếu nút không hoạt động, hãy sao chép liên kết này vào trình duyệt:</p>
      <p style="word-break:break-all;color:#2563eb">${link}</p>
      <p style="color:#71717a">Nếu bạn không tạo tài khoản này, hãy bỏ qua email.</p>
    </div>
  `;
}

async function sendVerificationEmail(user, rawToken) {
  const link = verificationLink(user, rawToken);
  await sendEmail(
    user.email,
    "Xác minh tài khoản Northstar Learning",
    verificationEmailHtml(user, link),
  );
  return link;
}

function verificationConfigMessage(error) {
  if (error.provider === "brevo" && error.status === 401) {
    return "Dịch vụ email chưa được cấu hình đúng. Vui lòng kiểm tra Brevo API key.";
  }
  if (error.provider === "brevo" && [400, 401, 403].includes(error.status)) {
    return "Dịch vụ email chưa chấp nhận người gửi. Vui lòng kiểm tra sender trong Brevo.";
  }
  return "Không thể gửi email xác minh. Vui lòng thử lại sau.";
}

async function deliverVerificationEmail(user, rawToken) {
  try {
    return await sendVerificationEmail(user, rawToken);
  } catch (error) {
    logEmailFailure(error, {
      type: "verification",
      userId: userId(user),
      to: user.email,
    });
    throw emailUnavailableError(verificationConfigMessage(error));
  }
}

async function deliverResetPasswordEmail(user, resetUrl) {
  try {
    await sendEmail(
      user.email,
      "Đặt lại mật khẩu Northstar Learning",
      `<p>Đặt lại mật khẩu tại <a href="${resetUrl}">${resetUrl}</a>. Link có hiệu lực trong 15 phút.</p>`,
    );
  } catch (error) {
    logEmailFailure(error, {
      type: "reset_password",
      userId: userId(user),
      to: user.email,
    });
    throw emailUnavailableError(
      "Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau",
    );
  }
}

async function issueSession(user) {
  const sessionUser = tokenUser(user);
  const accessToken = generateAccessToken(sessionUser);
  const refreshToken = generateRefreshToken(sessionUser);
  await User.updateOne(
    { _id: sessionUser.id },
    { $set: { refreshToken: hashToken(refreshToken) } },
  );
  return { accessToken, refreshToken, user: publicUser(user) };
}

async function uniqueGoogleUsername(name, email) {
  const source = (name || email.split("@")[0] || "learner")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .slice(0, 16) || "learner";

  let candidate = source;
  while (await User.exists({ username: candidate })) {
    candidate = `${source.slice(0, 15)}${crypto.randomInt(1000, 9999)}`.slice(0, 20);
  }
  return candidate;
}

export async function register(data) {
  const exists = await User.exists({
    $or: [{ email: data.email }, { username: data.username }],
  });
  if (exists) throw createError(409, "Email hoặc username đã tồn tại");

  const rawVerificationToken = createRandomToken();
  const user = await User.create({
    username: data.username,
    email: data.email,
    password: await hashPassword(data.password),
    role: "student",
    authProvider: "local",
    verifyToken: hashToken(rawVerificationToken),
    verifyTokenExpire: new Date(Date.now() + VERIFY_TOKEN_TTL),
    verifyOtpAttempts: 0,
    verifyOtpLastSentAt: new Date(),
  });

  let link;
  try {
    link = await deliverVerificationEmail(user, rawVerificationToken);
  } catch (error) {
    await User.deleteOne({ _id: user._id, isVerified: false });
    throw error;
  }

  return {
    user: publicUser(user),
    emailQueued: true,
    emailSent: true,
    verificationToken: devValue(rawVerificationToken),
    verificationLink: devValue(link),
  };
}

export async function verifyEmail(rawToken, email) {
  const normalizedEmail = email?.trim().toLowerCase();
  const query = normalizedEmail
    ? { email: normalizedEmail }
    : { verifyToken: hashToken(rawToken) };
  const user = await User.findOne(query).select(
    "+verifyToken +verifyTokenExpire +verifyOtpAttempts",
  );

  if (!user || user.isVerified || !user.verifyToken) {
    throw createError(400, "Liên kết xác minh không hợp lệ hoặc tài khoản đã được xác minh");
  }
  if (!user.verifyTokenExpire || user.verifyTokenExpire <= new Date()) {
    throw createError(400, "Liên kết xác minh đã hết hạn. Vui lòng yêu cầu link mới");
  }
  if (user.verifyOtpAttempts >= VERIFY_TOKEN_MAX_ATTEMPTS) {
    throw createError(429, "Bạn đã thử sai quá nhiều lần. Vui lòng yêu cầu link mới");
  }
  if (user.verifyToken !== hashToken(rawToken)) {
    user.verifyOtpAttempts += 1;
    await user.save();
    throw createError(400, "Liên kết xác minh không đúng");
  }

  user.isVerified = true;
  user.verifyToken = undefined;
  user.verifyTokenExpire = undefined;
  user.verifyOtpAttempts = 0;
  user.verifyOtpLastSentAt = undefined;
  await user.save();
  return publicUser(user);
}

export async function resendVerification(email) {
  const user = await User.findOne({ email }).select(
    "+verifyToken +verifyTokenExpire +verifyOtpAttempts +verifyOtpLastSentAt",
  );

  if (!user || user.isVerified) return {};
  if (
    user.verifyOtpLastSentAt &&
    Date.now() - user.verifyOtpLastSentAt.getTime() < VERIFY_TOKEN_COOLDOWN
  ) {
    throw createError(429, "Vui lòng chờ 60 giây trước khi gửi lại link xác minh");
  }

  const previousVerification = {
    verifyToken: user.verifyToken,
    verifyTokenExpire: user.verifyTokenExpire,
    verifyOtpAttempts: user.verifyOtpAttempts,
    verifyOtpLastSentAt: user.verifyOtpLastSentAt,
  };

  const rawVerificationToken = createRandomToken();
  user.verifyToken = hashToken(rawVerificationToken);
  user.verifyTokenExpire = new Date(Date.now() + VERIFY_TOKEN_TTL);
  user.verifyOtpAttempts = 0;
  user.verifyOtpLastSentAt = new Date();
  await user.save();

  let link;
  try {
    link = await deliverVerificationEmail(user, rawVerificationToken);
  } catch (error) {
    user.verifyToken = previousVerification.verifyToken;
    user.verifyTokenExpire = previousVerification.verifyTokenExpire;
    user.verifyOtpAttempts = previousVerification.verifyOtpAttempts;
    user.verifyOtpLastSentAt = previousVerification.verifyOtpLastSentAt;
    await user.save();
    throw error;
  }

  return {
    emailQueued: true,
    emailSent: true,
    verificationToken: devValue(rawVerificationToken),
    verificationLink: devValue(link),
  };
}

export async function login(email, password) {
  const user = await User.findOne({ email })
    .select("+password")
    .lean();

  if (!user?.password || !(await comparePassword(password, user.password))) {
    throw createError(401, "Email hoặc mật khẩu không đúng");
  }
  if (!user.isVerified) {
    throw createError(403, "Tài khoản chưa được xác minh qua email");
  }

  return issueSession(user);
}

export async function loginWithGoogle(credential) {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw createError(503, "Đăng nhập Google chưa được cấu hình");
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    throw createError(401, "Google credential không hợp lệ hoặc đã hết hạn");
  }

  if (!payload?.sub || !payload.email || !payload.email_verified) {
    throw createError(401, "Google chưa xác minh địa chỉ email này");
  }

  const email = payload.email.toLowerCase();
  let user = await User.findOne({
    $or: [{ googleId: payload.sub }, { email }],
  })
    .select("+googleId")
    .lean();

  if (user) {
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          googleId: payload.sub,
          isVerified: true,
          avatar: user.avatar || payload.picture || null,
        },
      },
    );
    user = {
      ...user,
      googleId: payload.sub,
      isVerified: true,
      avatar: user.avatar || payload.picture || null,
    };
  } else {
    const created = await User.create({
      username: await uniqueGoogleUsername(payload.name, email),
      email,
      googleId: payload.sub,
      authProvider: "google",
      isVerified: true,
      avatar: payload.picture || null,
      role: "student",
    });
    user = created.toObject();
  }

  return issueSession(user);
}

export async function rotateRefreshToken(rawRefreshToken) {
  const payload = verifyRefreshToken(rawRefreshToken);
  if (!payload?.id) throw createError(401, "Refresh token không hợp lệ");

  const user = await User.findById(payload.id).select("+refreshToken").lean();
  if (!user?.refreshToken) {
    throw createError(401, "Refresh token không hợp lệ");
  }

  if (user.refreshToken !== hashToken(rawRefreshToken)) {
    await User.updateOne({ _id: payload.id }, { $set: { refreshToken: null } });
    throw createError(401, "Refresh token đã bị thu hồi");
  }

  const result = await issueSession(user);
  return {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  };
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
  const user = await User.findOne({ email }).lean();
  if (!user) return {};

  const rawResetToken = createRandomToken();
  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        resetPasswordToken: hashToken(rawResetToken),
        resetPasswordExpire: new Date(Date.now() + RESET_TOKEN_TTL),
      },
    },
  );

  const resetUrl = `${frontendUrl()}/reset-password?token=${rawResetToken}`;

  try {
    await deliverResetPasswordEmail(user, resetUrl);
  } catch (error) {
    await User.updateOne(
      { _id: user._id },
      {
        $unset: {
          resetPasswordToken: "",
          resetPasswordExpire: "",
        },
      },
    );
    throw error;
  }

  return { resetToken: devValue(rawResetToken) };
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
