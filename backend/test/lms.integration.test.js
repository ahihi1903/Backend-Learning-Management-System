import "dotenv/config";
import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import app from "../app.js";
import User from "../src/models/User.js";
import Lesson from "../src/models/Lesson.js";
import Comment from "../src/models/Comment.js";
import Enrollment from "../src/models/Enrollment.js";
import LessonProgress from "../src/models/LessonProgress.js";
import Quiz from "../src/models/Quiz.js";
import QuizAttempt from "../src/models/QuizAttempt.js";
import Assignment from "../src/models/Assignment.js";
import AssignmentSubmission from "../src/models/AssignmentSubmission.js";
import { hashPassword } from "../src/utils/hash.js";

const integrationTest = process.env.TEST_MONGO_URI ? test : test.skip;

integrationTest("complete LMS flow and cascade integrity", async (t) => {
  let server;
  try {
    await mongoose.connect(process.env.TEST_MONGO_URI, {
      serverSelectionTimeoutMS: 2_000,
    });
  } catch (error) {
    if (error.name === "MongooseServerSelectionError") {
      t.skip(`Mongo test database is not available: ${error.message}`);
      return;
    }
    throw error;
  }

  if (!mongoose.connection.name.endsWith("_test")) {
    await mongoose.disconnect();
    throw new Error("TEST_MONGO_URI phải trỏ tới database có hậu tố _test");
  }

  try {
    await mongoose.connection.dropDatabase();
    server = await new Promise((resolve) => {
      const instance = app.listen(0, "127.0.0.1", () => resolve(instance));
    });
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    async function request(path, { method = "GET", token, body } = {}) {
      const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      const text = await response.text();
      return {
        status: response.status,
        body: text ? JSON.parse(text) : null,
      };
    }

    const password = await hashPassword("StrongPass1");
    const [admin, teacher, student] = await User.create([
      {
        username: "admin_test",
        email: "admin@test.local",
        password,
        role: "admin",
        isVerified: true,
      },
      {
        username: "teacher_test",
        email: "teacher@test.local",
        password,
        role: "teacher",
        isVerified: true,
      },
      {
        username: "student_test",
        email: "student@test.local",
        password,
        role: "student",
        isVerified: true,
      },
    ]);

    async function login(email) {
      const response = await request("/api/auth/login", {
        method: "POST",
        body: { email, password: "StrongPass1" },
      });
      assert.equal(response.status, 200);
      return response.body.accessToken;
    }

    const [adminToken, teacherToken, studentToken] = await Promise.all([
      login(admin.email),
      login(teacher.email),
      login(student.email),
    ]);

    const categoryResponse = await request("/api/categories", {
      method: "POST",
      token: adminToken,
      body: { name: "Integration Test Category" },
    });
    assert.equal(categoryResponse.status, 201);
    const categoryId = categoryResponse.body._id;

    const courseResponse = await request("/api/courses", {
      method: "POST",
      token: teacherToken,
      body: {
        title: "Integration Course",
        description: "Course used by integration tests",
        category: categoryId,
        price: 0,
      },
    });
    assert.equal(courseResponse.status, 201);
    const courseId = courseResponse.body._id;

    const hiddenDraft = await request(`/api/courses/${courseId}`);
    assert.equal(hiddenDraft.status, 404);

    const lessonResponse = await request(`/api/courses/${courseId}/lessons`, {
      method: "POST",
      token: teacherToken,
      body: { title: "Integration Lesson", content: "Lesson content", order: 1 },
    });
    assert.equal(lessonResponse.status, 201);
    const lessonId = lessonResponse.body._id;

    const publishResponse = await request(`/api/courses/${courseId}`, {
      method: "PUT",
      token: teacherToken,
      body: { isPublished: true },
    });
    assert.equal(publishResponse.status, 200);

    const deniedLesson = await request(`/api/courses/${courseId}/lessons`, {
      token: studentToken,
    });
    assert.equal(deniedLesson.status, 403);

    const enrollmentResponse = await request(
      `/api/courses/${courseId}/enrollments`,
      { method: "POST", token: studentToken },
    );
    assert.equal(enrollmentResponse.status, 201);

    const allowedLesson = await request(`/api/courses/${courseId}/lessons`, {
      token: studentToken,
    });
    assert.equal(allowedLesson.status, 200);

    const progressResponse = await request(
      `/api/courses/${courseId}/progress/lessons/${lessonId}`,
      {
        method: "PUT",
        token: studentToken,
        body: { completed: true, lastPositionSeconds: 120 },
      },
    );
    assert.equal(progressResponse.status, 200);
    assert.equal(progressResponse.body.percentage, 100);

    const commentResponse = await request(`/api/lessons/${lessonId}/comments`, {
      method: "POST",
      token: studentToken,
      body: { content: "Integration comment" },
    });
    assert.equal(commentResponse.status, 201);

    const quizResponse = await request(`/api/lessons/${lessonId}/quizzes`, {
      method: "POST",
      token: teacherToken,
      body: {
        title: "Integration Quiz",
        isPublished: true,
        passingScore: 60,
        questions: [
          {
            text: "What is 2 + 2?",
            options: ["3", "4"],
            correctOption: 1,
            points: 1,
          },
        ],
      },
    });
    assert.equal(quizResponse.status, 201);
    const quizId = quizResponse.body._id;

    const quizAttempt = await request(
      `/api/lessons/${lessonId}/quizzes/${quizId}/submit`,
      { method: "POST", token: studentToken, body: { answers: [1] } },
    );
    assert.equal(quizAttempt.status, 201);
    assert.equal(quizAttempt.body.score, 100);

    const assignmentResponse = await request(
      `/api/lessons/${lessonId}/assignments`,
      {
        method: "POST",
        token: teacherToken,
        body: {
          title: "Integration Assignment",
          instructions: "Write a complete integration test response",
          maxScore: 100,
          isPublished: true,
        },
      },
    );
    assert.equal(assignmentResponse.status, 201);
    const assignmentId = assignmentResponse.body._id;

    const submissionResponse = await request(
      `/api/lessons/${lessonId}/assignments/${assignmentId}/submissions`,
      {
        method: "POST",
        token: studentToken,
        body: { content: "My integration assignment submission" },
      },
    );
    assert.equal(submissionResponse.status, 201);

    const gradeResponse = await request(
      `/api/lessons/${lessonId}/assignments/${assignmentId}/submissions/${submissionResponse.body._id}/grade`,
      {
        method: "PATCH",
        token: teacherToken,
        body: { score: 90, feedback: "Good work" },
      },
    );
    assert.equal(gradeResponse.status, 200);
    assert.equal(gradeResponse.body.status, "graded");

    const deleteCourseResponse = await request(`/api/courses/${courseId}`, {
      method: "DELETE",
      token: teacherToken,
    });
    assert.equal(deleteCourseResponse.status, 200);

    const orphanCounts = await Promise.all([
      Lesson.countDocuments({ course: courseId }),
      Comment.countDocuments({ lesson: lessonId }),
      Enrollment.countDocuments({ course: courseId }),
      LessonProgress.countDocuments({ course: courseId }),
      Quiz.countDocuments({ course: courseId }),
      QuizAttempt.countDocuments({ quiz: quizId }),
      Assignment.countDocuments({ course: courseId }),
      AssignmentSubmission.countDocuments({ assignment: assignmentId }),
    ]);
    assert.deepEqual(orphanCounts, [0, 0, 0, 0, 0, 0, 0, 0]);
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
    if (mongoose.connection.readyState) {
      await mongoose.connection.dropDatabase();
      await mongoose.disconnect();
    }
  }
});
