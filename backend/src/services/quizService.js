import Lesson from "../models/Lesson.js";
import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import createError from "../middlewares/createError.js";
import {
  assertCourseOwnerOrAdmin,
  getLessonWithAccess,
} from "./accessService.js";
import { withTransaction } from "../utils/transaction.js";

function hideAnswers(quiz) {
  return {
    ...quiz,
    questions: quiz.questions.map(({ correctOption, ...question }) => question),
  };
}

async function getAuthorContext(lessonId, user) {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw createError(404, "Lesson not found");
  await assertCourseOwnerOrAdmin(lesson.course, user);
  return lesson;
}

export async function createQuiz(lessonId, user, data) {
  const lesson = await getAuthorContext(lessonId, user);
  return Quiz.create({
    ...data,
    lesson: lessonId,
    course: lesson.course,
    createdBy: user.id,
  });
}

export async function listQuizzes(lessonId, user) {
  const { course } = await getLessonWithAccess(lessonId, user);
  const canManage =
    user.role === "admin" || course.teacher.toString() === user.id;
  const filter = { lesson: lessonId };
  if (!canManage) filter.isPublished = true;

  const quizzes = await Quiz.find(filter).sort({ createdAt: -1 }).lean();
  return canManage ? quizzes : quizzes.map(hideAnswers);
}

export async function getQuiz(lessonId, quizId, user) {
  const { course } = await getLessonWithAccess(lessonId, user);
  const canManage =
    user.role === "admin" || course.teacher.toString() === user.id;

  const quiz = await Quiz.findOne({ _id: quizId, lesson: lessonId }).lean();
  if (!quiz || (!quiz.isPublished && !canManage)) {
    throw createError(404, "Quiz not found");
  }
  return canManage ? quiz : hideAnswers(quiz);
}

export async function updateQuiz(lessonId, quizId, user, data) {
  await getAuthorContext(lessonId, user);
  const quiz = await Quiz.findOneAndUpdate(
    { _id: quizId, lesson: lessonId },
    data,
    { returnDocument: "after", runValidators: true },
  );
  if (!quiz) throw createError(404, "Quiz not found");
  return quiz;
}

export async function deleteQuiz(lessonId, quizId, user) {
  await getAuthorContext(lessonId, user);
  const quiz = await withTransaction(async (session) => {
    const deleted = await Quiz.findOneAndDelete(
      { _id: quizId, lesson: lessonId },
      { session },
    );
    if (deleted) await QuizAttempt.deleteMany({ quiz: quizId }, { session });
    return deleted;
  });
  if (!quiz) throw createError(404, "Quiz not found");
}

export async function submitQuiz(lessonId, quizId, user, answers) {
  await getLessonWithAccess(lessonId, user);
  const quiz = await Quiz.findOne({
    _id: quizId,
    lesson: lessonId,
    isPublished: true,
  });
  if (!quiz) throw createError(404, "Quiz not found");
  if (answers.length !== quiz.questions.length) {
    throw createError(400, "Số lượng câu trả lời không hợp lệ");
  }

  let earnedPoints = 0;
  let totalPoints = 0;
  quiz.questions.forEach((question, index) => {
    totalPoints += question.points;
    if (answers[index] === question.correctOption) earnedPoints += question.points;
  });
  const score = Math.round((earnedPoints / totalPoints) * 100);

  return QuizAttempt.create({
    quiz: quizId,
    user: user.id,
    answers,
    score,
    earnedPoints,
    totalPoints,
    passed: score >= quiz.passingScore,
  });
}

export async function getMyAttempts(lessonId, quizId, user) {
  await getLessonWithAccess(lessonId, user);
  const quiz = await Quiz.exists({ _id: quizId, lesson: lessonId });
  if (!quiz) throw createError(404, "Quiz not found");
  return QuizAttempt.find({ quiz: quizId, user: user.id }).sort({ createdAt: -1 });
}
