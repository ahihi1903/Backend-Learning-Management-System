// src/services/commentService.js
import Comment from "../models/Comment.js";
import Lesson from "../models/Lesson.js";
import createError from "../middlewares/createError.js";

export async function getCommentsByLesson(lessonId) {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw createError(404, "Lesson not found");

  return await Comment.find({ lesson: lessonId })
    .populate("user", "username avatar") // hiển thị tên người bình luận
    .sort({ createdAt: -1 }); // mới nhất trước
}

export async function createComment(lessonId, userId, content) {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw createError(404, "Lesson not found");

  const comment = await Comment.create({
    content,
    lesson: lessonId,
    user: userId, // server tự gán từ token
  });

  // populate user trước khi trả về để client thấy username ngay
  return await comment.populate("user", "username avatar");
}

export async function updateComment(
  lessonId,
  commentId,
  userId,
  userRole,
  content,
) {
  const comment = await Comment.findOne({
    _id: commentId,
    lesson: lessonId,
  });

  if (!comment) throw createError(404, "Comment not found");

  // ⭐ Ownership check theo User — khác Lesson check theo Course
  const isOwner = comment.user.toString() === userId;
  const isAdmin = userRole === "admin";

  if (!isOwner && !isAdmin) {
    throw createError(403, "Bạn không có quyền sửa comment này");
  }

  comment.content = content;
  return await comment.save();
}

export async function deleteComment(lessonId, commentId, userId, userRole) {
  const comment = await Comment.findOne({
    _id: commentId,
    lesson: lessonId,
  });

  if (!comment) throw createError(404, "Comment not found");

  const isOwner = comment.user.toString() === userId;
  const isAdmin = userRole === "admin";

  if (!isOwner && !isAdmin) {
    throw createError(403, "Bạn không có quyền xóa comment này");
  }

  await Comment.findByIdAndDelete(commentId);
}
