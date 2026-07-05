import User from "../models/User.js";
import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import Comment from "../models/Comment.js";
import Enrollment from "../models/Enrollment.js";
import LessonProgress from "../models/LessonProgress.js";
import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import Assignment from "../models/Assignment.js";
import AssignmentSubmission from "../models/AssignmentSubmission.js";

function ids(documents) {
  return documents.map((document) => document._id);
}

export async function deleteLessonCascade(lessonId, session) {
  const quizzes = await Quiz.find({ lesson: lessonId }, "_id").session(session);
  const assignments = await Assignment.find(
    { lesson: lessonId },
    "_id",
  ).session(session);

  await QuizAttempt.deleteMany({ quiz: { $in: ids(quizzes) } }, { session });
  await AssignmentSubmission.deleteMany(
    { assignment: { $in: ids(assignments) } },
    { session },
  );
  await Quiz.deleteMany({ lesson: lessonId }, { session });
  await Assignment.deleteMany({ lesson: lessonId }, { session });
  await Comment.deleteMany({ lesson: lessonId }, { session });
  await LessonProgress.deleteMany({ lesson: lessonId }, { session });

  return Lesson.findByIdAndDelete(lessonId, { session });
}

export async function deleteCourseCascade(courseId, session) {
  const lessons = await Lesson.find({ course: courseId }, "_id").session(session);
  const quizzes = await Quiz.find({ course: courseId }, "_id").session(session);
  const assignments = await Assignment.find(
    { course: courseId },
    "_id",
  ).session(session);

  await QuizAttempt.deleteMany({ quiz: { $in: ids(quizzes) } }, { session });
  await AssignmentSubmission.deleteMany(
    { assignment: { $in: ids(assignments) } },
    { session },
  );
  await Quiz.deleteMany({ course: courseId }, { session });
  await Assignment.deleteMany({ course: courseId }, { session });
  await Comment.deleteMany({ lesson: { $in: ids(lessons) } }, { session });
  await LessonProgress.deleteMany({ course: courseId }, { session });
  await Enrollment.deleteMany({ course: courseId }, { session });
  await Lesson.deleteMany({ course: courseId }, { session });

  return Course.findByIdAndDelete(courseId, { session });
}

export async function deleteUserCascade(userId, session) {
  const ownedCourses = await Course.find({ teacher: userId }, "_id").session(
    session,
  );
  for (const course of ownedCourses) {
    await deleteCourseCascade(course._id, session);
  }

  await Comment.deleteMany({ user: userId }, { session });
  await Enrollment.deleteMany({ user: userId }, { session });
  await LessonProgress.deleteMany({ user: userId }, { session });
  await QuizAttempt.deleteMany({ user: userId }, { session });
  await AssignmentSubmission.deleteMany({ user: userId }, { session });

  return User.findByIdAndDelete(userId, { session });
}

export async function deleteEnrollmentCascade(userId, courseId, session) {
  const quizzes = await Quiz.find({ course: courseId }, "_id").session(session);
  const assignments = await Assignment.find(
    { course: courseId },
    "_id",
  ).session(session);

  await QuizAttempt.deleteMany(
    { user: userId, quiz: { $in: ids(quizzes) } },
    { session },
  );
  await AssignmentSubmission.deleteMany(
    { user: userId, assignment: { $in: ids(assignments) } },
    { session },
  );
  await LessonProgress.deleteMany({ user: userId, course: courseId }, { session });
  return Enrollment.findOneAndDelete(
    { user: userId, course: courseId },
    { session },
  );
}
