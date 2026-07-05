import * as progressService from "../services/progressService.js";

export async function update(req, res) {
  const result = await progressService.updateLessonProgress(
    req.params.courseId,
    req.params.lessonId,
    req.user.id,
    req.body,
  );
  res.json(result);
}

export async function getMine(req, res) {
  const result = await progressService.getMyProgress(
    req.params.courseId,
    req.user.id,
  );
  res.json(result);
}

export async function getStudent(req, res) {
  const result = await progressService.getStudentProgress(
    req.params.courseId,
    req.params.userId,
    req.user,
  );
  res.json(result);
}
