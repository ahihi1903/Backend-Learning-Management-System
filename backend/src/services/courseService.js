// src/services/courseService.js
import Course from "../models/Course.js";
import Category from "../models/Category.js";
import createError from "../middlewares/createError.js";
import { withTransaction } from "../utils/transaction.js";
import { deleteCourseCascade } from "./cascadeService.js";
import escapeRegex from "../utils/escapeRegex.js";

export async function createCourse(teacherId, data) {
  // kiểm tra category tồn tại trước khi tạo
  const category = await Category.findById(data.category);
  if (!category) throw createError(404, "Category not found");

  return await Course.create({
    ...data,
    teacher: teacherId, // server tự gán — không nhận từ client
    isPublished: false,
  });
}

export async function getAllCourses(query = {}) {
  const { category, search, page = 1, limit = 10 } = query;

  const filter = { isPublished: true }; // student chỉ thấy course đã publish

  if (category) filter.category = category;

  if (search) {
    filter.title = { $regex: escapeRegex(search), $options: "i" };
  }

  const skip = (page - 1) * limit;

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .populate("teacher", "username avatar") // chỉ lấy field cần
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Course.countDocuments(filter),
  ]);

  return {
    courses,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getCourseById(id, requester) {
  const course = await Course.findById(id)
    .populate("teacher", "username avatar")
    .populate("category", "name slug");

  if (!course) throw createError(404, "Course not found");

  if (!course.isPublished) {
    const isOwner = requester?.id === course.teacher?._id?.toString();
    const isAdmin = requester?.role === "admin";
    if (!isOwner && !isAdmin) throw createError(404, "Course not found");
  }

  return course;
}

export async function updateCourse(courseId, userId, userRole, data) {
  const course = await Course.findById(courseId);
  if (!course) throw createError(404, "Course not found");

  // ⭐ Ownership check — quan trọng nhất
  // admin sửa được tất cả, teacher chỉ sửa course của mình
  const isOwner = course.teacher.toString() === userId;
  const isAdmin = userRole === "admin";

  if (!isOwner && !isAdmin) {
    throw createError(403, "Bạn không có quyền sửa course này");
  }

  if (data.category) {
    const category = await Category.findById(data.category);
    if (!category) throw createError(404, "Category not found");
  }

  Object.assign(course, data);
  return await course.save();
}

export async function deleteCourse(courseId, userId, userRole) {
  const course = await Course.findById(courseId);
  if (!course) throw createError(404, "Course not found");

  const isOwner = course.teacher.toString() === userId;
  const isAdmin = userRole === "admin";

  if (!isOwner && !isAdmin) {
    throw createError(403, "Bạn không có quyền xóa course này");
  }

  await withTransaction((session) => deleteCourseCascade(courseId, session));
}

// teacher xem tất cả course của mình (kể cả draft)
export async function getMyCourses(teacherId) {
  return await Course.find({ teacher: teacherId })
    .populate("category", "name slug")
    .sort({ createdAt: -1 });
}
