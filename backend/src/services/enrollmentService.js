import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import createError from "../middlewares/createError.js";
import { assertCourseOwnerOrAdmin } from "./accessService.js";
import { withTransaction } from "../utils/transaction.js";
import { deleteEnrollmentCascade } from "./cascadeService.js";

export async function enroll(courseId, userId) {
  const course = await Course.findById(courseId);
  if (!course || !course.isPublished) throw createError(404, "Course not found");

  const existing = await Enrollment.findOne({ user: userId, course: courseId });
  if (existing) throw createError(409, "Bạn đã đăng ký khóa học này");

  try {
    return await Enrollment.create({ user: userId, course: courseId });
  } catch (error) {
    if (error.code === 11000) throw createError(409, "Bạn đã đăng ký khóa học này");
    throw error;
  }
}

export async function getMyEnrollment(courseId, userId) {
  const enrollment = await Enrollment.findOne({
    user: userId,
    course: courseId,
  }).populate("course", "title thumbnail isPublished");
  if (!enrollment) throw createError(404, "Enrollment not found");
  return enrollment;
}

export async function listMyEnrollments(userId) {
  return Enrollment.find({ user: userId })
    .populate({
      path: "course",
      select: "title description thumbnail category teacher isPublished",
      populate: [
        { path: "category", select: "name slug" },
        { path: "teacher", select: "username avatar" },
      ],
    })
    .sort({ updatedAt: -1 });
}

export async function listCourseEnrollments(courseId, requester) {
  await assertCourseOwnerOrAdmin(courseId, requester);
  return Enrollment.find({ course: courseId })
    .populate("user", "username email avatar")
    .sort({ createdAt: -1 });
}

export async function unenroll(courseId, userId) {
  const enrollment = await withTransaction((session) =>
    deleteEnrollmentCascade(userId, courseId, session),
  );
  if (!enrollment) throw createError(404, "Enrollment not found");
}
