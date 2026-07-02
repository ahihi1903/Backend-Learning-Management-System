// src/controllers/courseController.js
import * as courseService from "../services/courseService.js";

export async function create(req, res) {
  const course = await courseService.createCourse(req.user.id, req.body);
  res.status(201).json(course);
}

export async function getAll(req, res) {
  const result = await courseService.getAllCourses(req.query);
  res.json(result);
}

export async function getById(req, res) {
  const course = await courseService.getCourseById(req.params.id);
  res.json(course);
}

export async function update(req, res) {
  const course = await courseService.updateCourse(
    req.params.id,
    req.user.id,
    req.user.role,
    req.body,
  );
  res.json(course);
}

export async function remove(req, res) {
  await courseService.deleteCourse(req.params.id, req.user.id, req.user.role);
  res.json({ message: "Course deleted" });
}

export async function getMyCourses(req, res) {
  const courses = await courseService.getMyCourses(req.user.id);
  res.json(courses);
}
