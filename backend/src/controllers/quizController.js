import * as quizService from "../services/quizService.js";

export async function create(req, res) {
  const quiz = await quizService.createQuiz(req.params.lessonId, req.user, req.body);
  res.status(201).json(quiz);
}

export async function list(req, res) {
  res.json(await quizService.listQuizzes(req.params.lessonId, req.user));
}

export async function getById(req, res) {
  res.json(
    await quizService.getQuiz(req.params.lessonId, req.params.quizId, req.user),
  );
}

export async function update(req, res) {
  res.json(
    await quizService.updateQuiz(
      req.params.lessonId,
      req.params.quizId,
      req.user,
      req.body,
    ),
  );
}

export async function remove(req, res) {
  await quizService.deleteQuiz(req.params.lessonId, req.params.quizId, req.user);
  res.json({ message: "Quiz deleted" });
}

export async function submit(req, res) {
  const attempt = await quizService.submitQuiz(
    req.params.lessonId,
    req.params.quizId,
    req.user,
    req.body.answers,
  );
  res.status(201).json(attempt);
}

export async function myAttempts(req, res) {
  res.json(
    await quizService.getMyAttempts(
      req.params.lessonId,
      req.params.quizId,
      req.user,
    ),
  );
}
