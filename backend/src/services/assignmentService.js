import Lesson from "../models/Lesson.js";
import Assignment from "../models/Assignment.js";
import AssignmentSubmission from "../models/AssignmentSubmission.js";
import createError from "../middlewares/createError.js";
import {
  assertCourseOwnerOrAdmin,
  getLessonWithAccess,
} from "./accessService.js";
import { withTransaction } from "../utils/transaction.js";

async function getAuthorContext(lessonId, user) {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw createError(404, "Lesson not found");
  await assertCourseOwnerOrAdmin(lesson.course, user);
  return lesson;
}

export async function createAssignment(lessonId, user, data) {
  const lesson = await getAuthorContext(lessonId, user);
  return Assignment.create({
    ...data,
    lesson: lessonId,
    course: lesson.course,
    createdBy: user.id,
  });
}

export async function listAssignments(lessonId, user) {
  const { course } = await getLessonWithAccess(lessonId, user);
  const canManage =
    user.role === "admin" || course.teacher.toString() === user.id;
  const filter = { lesson: lessonId };
  if (!canManage) filter.isPublished = true;
  return Assignment.find(filter).sort({ createdAt: -1 });
}

export async function getAssignment(lessonId, assignmentId, user) {
  const { course } = await getLessonWithAccess(lessonId, user);
  const canManage =
    user.role === "admin" || course.teacher.toString() === user.id;
  const assignment = await Assignment.findOne({
    _id: assignmentId,
    lesson: lessonId,
  });
  if (!assignment || (!assignment.isPublished && !canManage)) {
    throw createError(404, "Assignment not found");
  }
  return assignment;
}

export async function updateAssignment(lessonId, assignmentId, user, data) {
  await getAuthorContext(lessonId, user);
  const assignment = await Assignment.findOneAndUpdate(
    { _id: assignmentId, lesson: lessonId },
    data,
    { returnDocument: "after", runValidators: true },
  );
  if (!assignment) throw createError(404, "Assignment not found");
  return assignment;
}

export async function deleteAssignment(lessonId, assignmentId, user) {
  await getAuthorContext(lessonId, user);
  const assignment = await withTransaction(async (session) => {
    const deleted = await Assignment.findOneAndDelete(
      { _id: assignmentId, lesson: lessonId },
      { session },
    );
    if (deleted) {
      await AssignmentSubmission.deleteMany(
        { assignment: assignmentId },
        { session },
      );
    }
    return deleted;
  });
  if (!assignment) throw createError(404, "Assignment not found");
}

export async function submitAssignment(lessonId, assignmentId, user, data) {
  await getLessonWithAccess(lessonId, user);
  const assignment = await Assignment.findOne({
    _id: assignmentId,
    lesson: lessonId,
    isPublished: true,
  });
  if (!assignment) throw createError(404, "Assignment not found");
  if (assignment.dueDate && assignment.dueDate < new Date()) {
    throw createError(400, "Assignment đã hết hạn nộp bài");
  }

  return AssignmentSubmission.findOneAndUpdate(
    { assignment: assignmentId, user: user.id },
    {
      $set: {
        content: data.content || "",
        fileUrl: data.fileUrl || null,
        status: "submitted",
        score: null,
        feedback: "",
        submittedAt: new Date(),
        gradedAt: null,
        gradedBy: null,
      },
      $setOnInsert: { assignment: assignmentId, user: user.id },
    },
    { returnDocument: "after", upsert: true, runValidators: true },
  );
}

export async function getMySubmission(lessonId, assignmentId, user) {
  await getLessonWithAccess(lessonId, user);
  const submission = await AssignmentSubmission.findOne({
    assignment: assignmentId,
    user: user.id,
  });
  if (!submission) throw createError(404, "Submission not found");
  return submission;
}

export async function listSubmissions(lessonId, assignmentId, user) {
  await getAuthorContext(lessonId, user);
  const assignment = await Assignment.exists({
    _id: assignmentId,
    lesson: lessonId,
  });
  if (!assignment) throw createError(404, "Assignment not found");
  return AssignmentSubmission.find({ assignment: assignmentId })
    .populate("user", "username email avatar")
    .sort({ submittedAt: -1 });
}

export async function gradeSubmission(
  lessonId,
  assignmentId,
  submissionId,
  user,
  data,
) {
  await getAuthorContext(lessonId, user);
  const assignment = await Assignment.findOne({
    _id: assignmentId,
    lesson: lessonId,
  });
  if (!assignment) throw createError(404, "Assignment not found");
  if (data.score > assignment.maxScore) {
    throw createError(400, `Score không được vượt quá ${assignment.maxScore}`);
  }

  const submission = await AssignmentSubmission.findOneAndUpdate(
    { _id: submissionId, assignment: assignmentId },
    {
      score: data.score,
      feedback: data.feedback || "",
      status: "graded",
      gradedAt: new Date(),
      gradedBy: user.id,
    },
    { returnDocument: "after", runValidators: true },
  );
  if (!submission) throw createError(404, "Submission not found");
  return submission;
}
