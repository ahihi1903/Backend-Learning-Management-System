// src/controllers/commentController.js
import * as commentService from "../services/commentService.js";

export async function getAll(req, res) {
  const comments = await commentService.getCommentsByLesson(
    req.params.lessonId,
    req.user,
  );
  res.json(comments);
}

export async function create(req, res) {
  const comment = await commentService.createComment(
    req.params.lessonId,
    req.user.id,
    req.body.content,
    req.user,
  );
  res.status(201).json(comment);
}

export async function update(req, res) {
  const comment = await commentService.updateComment(
    req.params.lessonId,
    req.params.id,
    req.user.id,
    req.user.role,
    req.body.content,
  );
  res.json(comment);
}

export async function remove(req, res) {
  await commentService.deleteComment(
    req.params.lessonId,
    req.params.id,
    req.user.id,
    req.user.role,
  );
  res.json({ message: "Comment deleted" });
}
