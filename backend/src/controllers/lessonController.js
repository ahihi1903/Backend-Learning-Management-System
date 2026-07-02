// src/controllers/lessonController.js
import * as lessonService from "../services/lessonService.js";

export async function getAll(req, res) {
  const lessons = await lessonService.getLessonsByCourse(req.params.courseId);
  res.json(lessons);
}

export async function getById(req, res) {
  const lesson = await lessonService.getLessonById(
    req.params.courseId,
    req.params.id,
  );
  res.json(lesson);
}

export async function create(req, res) {
  const lesson = await lessonService.createLesson(
    req.params.courseId,
    req.user.id,
    req.user.role,
    req.body,
  );
  res.status(201).json(lesson);
}

export async function update(req, res) {
  const lesson = await lessonService.updateLesson(
    req.params.courseId,
    req.params.id,
    req.user.id,
    req.user.role,
    req.body,
  );
  res.json(lesson);
}

export async function remove(req, res) {
  await lessonService.deleteLesson(
    req.params.courseId,
    req.params.id,
    req.user.id,
    req.user.role,
  );
  res.json({ message: "Lesson deleted" });
}
