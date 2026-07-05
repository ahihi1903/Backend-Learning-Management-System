import * as assignmentService from "../services/assignmentService.js";

export async function create(req, res) {
  const assignment = await assignmentService.createAssignment(
    req.params.lessonId,
    req.user,
    req.body,
  );
  res.status(201).json(assignment);
}

export async function list(req, res) {
  res.json(await assignmentService.listAssignments(req.params.lessonId, req.user));
}

export async function getById(req, res) {
  res.json(
    await assignmentService.getAssignment(
      req.params.lessonId,
      req.params.assignmentId,
      req.user,
    ),
  );
}

export async function update(req, res) {
  res.json(
    await assignmentService.updateAssignment(
      req.params.lessonId,
      req.params.assignmentId,
      req.user,
      req.body,
    ),
  );
}

export async function remove(req, res) {
  await assignmentService.deleteAssignment(
    req.params.lessonId,
    req.params.assignmentId,
    req.user,
  );
  res.json({ message: "Assignment deleted" });
}

export async function submit(req, res) {
  const submission = await assignmentService.submitAssignment(
    req.params.lessonId,
    req.params.assignmentId,
    req.user,
    req.body,
  );
  res.status(201).json(submission);
}

export async function mySubmission(req, res) {
  res.json(
    await assignmentService.getMySubmission(
      req.params.lessonId,
      req.params.assignmentId,
      req.user,
    ),
  );
}

export async function listSubmissions(req, res) {
  res.json(
    await assignmentService.listSubmissions(
      req.params.lessonId,
      req.params.assignmentId,
      req.user,
    ),
  );
}

export async function grade(req, res) {
  res.json(
    await assignmentService.gradeSubmission(
      req.params.lessonId,
      req.params.assignmentId,
      req.params.submissionId,
      req.user,
      req.body,
    ),
  );
}
