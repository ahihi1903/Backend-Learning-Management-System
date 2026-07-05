import * as enrollmentService from "../services/enrollmentService.js";

export async function enroll(req, res) {
  const enrollment = await enrollmentService.enroll(
    req.params.courseId,
    req.user.id,
  );
  res.status(201).json(enrollment);
}

export async function getMine(req, res) {
  const enrollment = await enrollmentService.getMyEnrollment(
    req.params.courseId,
    req.user.id,
  );
  res.json(enrollment);
}

export async function listMine(req, res) {
  res.json(await enrollmentService.listMyEnrollments(req.user.id));
}

export async function list(req, res) {
  const enrollments = await enrollmentService.listCourseEnrollments(
    req.params.courseId,
    req.user,
  );
  res.json(enrollments);
}

export async function removeMine(req, res) {
  await enrollmentService.unenroll(req.params.courseId, req.user.id);
  res.json({ message: "Đã hủy đăng ký khóa học" });
}
