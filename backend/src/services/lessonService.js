// src/services/lessonService.js
import Lesson from "../models/Lesson.js";
import Course from "../models/Course.js";
import createError from "../middlewares/createError.js";
import { assertCourseContentAccess } from "./accessService.js";
import { withTransaction } from "../utils/transaction.js";
import { deleteLessonCascade } from "./cascadeService.js";

// ⭐ Helper dùng lại cho mọi thao tác write
async function checkCourseOwnership(courseId, userId, userRole) {
  const course = await Course.findById(courseId);
  if (!course) throw createError(404, "Course not found");

  const isOwner = course.teacher.toString() === userId;
  const isAdmin = userRole === "admin";

  if (!isOwner && !isAdmin) {
    throw createError(403, "Bạn không có quyền thao tác lesson này");
  }

  return course;
}

export async function getLessonsByCourse(courseId, requester) {
  await assertCourseContentAccess(courseId, requester);

  return await Lesson.find({ course: courseId }).sort({ order: 1 }); // ⭐ sắp xếp theo thứ tự bài học
}

export async function getLessonById(courseId, lessonId, requester) {
  await assertCourseContentAccess(courseId, requester);
  const lesson = await Lesson.findOne({
    _id: lessonId,
    course: courseId, // ⭐ đảm bảo lesson thuộc đúng course
  });

  if (!lesson) throw createError(404, "Lesson not found");
  return lesson;
}

export async function createLesson(courseId, userId, userRole, data) {
  await checkCourseOwnership(courseId, userId, userRole);

  return await Lesson.create({
    ...data,
    course: courseId, // server tự gán — không nhận từ client
  });
}

export async function updateLesson(courseId, lessonId, userId, userRole, data) {
  await checkCourseOwnership(courseId, userId, userRole);

  const lesson = await Lesson.findOneAndUpdate(
    { _id: lessonId, course: courseId },
    data,
    { returnDocument: "after" }, // trả về document sau khi update
  );

  if (!lesson) throw createError(404, "Lesson not found");
  return lesson;
}

export async function deleteLesson(courseId, lessonId, userId, userRole) {
  await checkCourseOwnership(courseId, userId, userRole);

  const lesson = await Lesson.findOne({ _id: lessonId, course: courseId });

  if (!lesson) throw createError(404, "Lesson not found");
  await withTransaction((session) => deleteLessonCascade(lessonId, session));
}
