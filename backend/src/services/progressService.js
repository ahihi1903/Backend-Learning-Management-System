import Enrollment from "../models/Enrollment.js";
import Lesson from "../models/Lesson.js";
import LessonProgress from "../models/LessonProgress.js";
import createError from "../middlewares/createError.js";
import { assertCourseOwnerOrAdmin } from "./accessService.js";

async function requireEnrollment(courseId, userId) {
  const enrollment = await Enrollment.findOne({
    course: courseId,
    user: userId,
    status: { $in: ["active", "completed"] },
  });
  if (!enrollment) throw createError(403, "Bạn chưa đăng ký khóa học này");
  return enrollment;
}

async function buildSummary(courseId, userId, enrollment) {
  const [totalLessons, completedLessons, lessons] = await Promise.all([
    Lesson.countDocuments({ course: courseId }),
    LessonProgress.countDocuments({
      course: courseId,
      user: userId,
      completed: true,
    }),
    LessonProgress.find({ course: courseId, user: userId })
      .populate("lesson", "title order")
      .sort({ updatedAt: -1 }),
  ]);

  const percentage = totalLessons
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  return {
    enrollmentId: enrollment.id,
    status: enrollment.status,
    totalLessons,
    completedLessons,
    percentage,
    lessons,
  };
}

export async function updateLessonProgress(courseId, lessonId, userId, data) {
  const enrollment = await requireEnrollment(courseId, userId);
  const lesson = await Lesson.findOne({ _id: lessonId, course: courseId });
  if (!lesson) throw createError(404, "Lesson not found");

  const update = {};
  if (data.lastPositionSeconds !== undefined) {
    update.lastPositionSeconds = data.lastPositionSeconds;
  }
  if (data.completed !== undefined) {
    update.completed = data.completed;
    update.completedAt = data.completed ? new Date() : null;
  }

  await LessonProgress.findOneAndUpdate(
    { user: userId, lesson: lessonId },
    {
      $set: update,
      $setOnInsert: {
        user: userId,
        course: courseId,
        lesson: lessonId,
        enrollment: enrollment.id,
      },
    },
    { returnDocument: "after", upsert: true, runValidators: true },
  );

  const totalLessons = await Lesson.countDocuments({ course: courseId });
  const completedLessons = await LessonProgress.countDocuments({
    course: courseId,
    user: userId,
    completed: true,
  });
  const completedCourse = totalLessons > 0 && completedLessons === totalLessons;

  enrollment.status = completedCourse ? "completed" : "active";
  enrollment.completedAt = completedCourse ? new Date() : null;
  await enrollment.save();

  return buildSummary(courseId, userId, enrollment);
}

export async function getMyProgress(courseId, userId) {
  const enrollment = await requireEnrollment(courseId, userId);
  return buildSummary(courseId, userId, enrollment);
}

export async function getStudentProgress(courseId, userId, requester) {
  await assertCourseOwnerOrAdmin(courseId, requester);
  const enrollment = await requireEnrollment(courseId, userId);
  return buildSummary(courseId, userId, enrollment);
}
