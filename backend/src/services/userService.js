// src/services/userService.js
import User from "../models/User.js";
import createError from "../middlewares/createError.js";
import { comparePassword, hashPassword } from "../utils/hash.js";

// Các field nhạy cảm không bao giờ trả về client
const EXCLUDE_FIELDS =
  "-password -verifyToken -resetPasswordToken -refreshToken";

export async function getAllUsers(query = {}) {
  const { page = 1, limit = 10, search, role } = query;

  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { username: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select(EXCLUDE_FIELDS)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getUserById(targetId, requesterId, requesterRole) {
  // admin xem được tất cả — user chỉ xem được chính mình
  if (requesterRole !== "admin" && targetId !== requesterId) {
    throw createError(403, "Bạn không có quyền xem thông tin này");
  }

  const user = await User.findById(targetId).select(EXCLUDE_FIELDS);
  if (!user) throw createError(404, "User not found");

  return user;
}

export async function updateUser(targetId, requesterId, requesterRole, data) {
  // admin sửa được tất cả — user chỉ sửa được chính mình
  if (requesterRole !== "admin" && targetId !== requesterId) {
    throw createError(403, "Bạn không có quyền sửa thông tin này");
  }

  // kiểm tra username/email trùng với người khác
  if (data.username || data.email) {
    const conditions = [];
    if (data.username) conditions.push({ username: data.username });
    if (data.email) conditions.push({ email: data.email });

    const exists = await User.findOne({
      $or: conditions,
      _id: { $ne: targetId }, // loại trừ chính user đang update
    });

    if (exists) throw createError(400, "Username hoặc email đã tồn tại");
  }

  const user = await User.findByIdAndUpdate(targetId, data, {
    new: true,
  }).select(EXCLUDE_FIELDS);

  if (!user) throw createError(404, "User not found");
  return user;
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId);
  if (!user) throw createError(404, "User not found");

  // kiểm tra password hiện tại đúng không
  const isMatch = await comparePassword(currentPassword, user.password);
  if (!isMatch) throw createError(401, "Mật khẩu hiện tại không đúng");

  user.password = await hashPassword(newPassword);
  await user.save();
}

export async function updateRole(targetId, role) {
  // chỉ admin gọi được — đã check ở route
  const user = await User.findByIdAndUpdate(
    targetId,
    { role },
    { new: true },
  ).select(EXCLUDE_FIELDS);

  if (!user) throw createError(404, "User not found");
  return user;
}

export async function deleteUser(targetId, requesterId, requesterRole) {
  // admin xóa được tất cả — user chỉ xóa được chính mình
  if (requesterRole !== "admin" && targetId !== requesterId) {
    throw createError(403, "Bạn không có quyền xóa tài khoản này");
  }

  // không cho phép xóa chính mình nếu là admin duy nhất
  if (requesterId === targetId && requesterRole === "admin") {
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount <= 1) {
      throw createError(400, "Không thể xóa admin duy nhất trong hệ thống");
    }
  }

  const user = await User.findByIdAndDelete(targetId);
  if (!user) throw createError(404, "User not found");
}
