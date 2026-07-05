import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Lesson from "../models/Lesson.js";
import createError from "../middlewares/createError.js";

export async function assertCourseOwnerOrAdmin(courseId, user) {
  const course = await Course.findById(courseId);
  if (!course) throw createError(404, "Course not found");

  const isOwner = course.teacher.toString() === user.id;
  const isAdmin = user.role === "admin";
  if (!isOwner && !isAdmin) throw createError(403, "Bạn không có quyền với course này");

  return course;
}

export async function assertCourseContentAccess(courseId, user) {
  const course = await Course.findById(courseId);
  if (!course) throw createError(404, "Course not found");

  const isOwner = course.teacher.toString() === user?.id;
  const isAdmin = user?.role === "admin";
  if (isOwner || isAdmin) return course;

  if (!course.isPublished) throw createError(404, "Course not found");
  if (!user) throw createError(401, "Bạn cần đăng nhập để xem nội dung khóa học");

  const enrollment = await Enrollment.findOne({
    user: user.id,
    course: courseId,
    status: { $in: ["active", "completed"] },
  });
  if (!enrollment) throw createError(403, "Bạn chưa đăng ký khóa học này");

  return course;
}

export async function getLessonWithAccess(lessonId, user) {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw createError(404, "Lesson not found");
  const course = await assertCourseContentAccess(lesson.course, user);
  return { lesson, course };
}
