import test from "node:test";
import assert from "node:assert/strict";
import { courseQuerySchema, idParamSchema } from "../src/validations/commonValidation.js";
import { createQuizSchema } from "../src/validations/quizValidation.js";
import { updateProgressSchema } from "../src/validations/progressValidation.js";
import { submitAssignmentSchema } from "../src/validations/assignmentValidation.js";

test("ObjectId and pagination query are validated", () => {
  assert.equal(idParamSchema.safeParse({ id: "bad-id" }).success, false);
  const query = courseQuerySchema.parse({ page: "2", limit: "25" });
  assert.deepEqual({ page: query.page, limit: query.limit }, { page: 2, limit: 25 });
  assert.equal(courseQuerySchema.safeParse({ page: "0" }).success, false);
  assert.equal(courseQuerySchema.safeParse({ limit: "101" }).success, false);
});

test("Quiz rejects a correctOption outside options", () => {
  const result = createQuizSchema.safeParse({
    title: "Invalid quiz",
    questions: [
      { text: "Question text", options: ["A", "B"], correctOption: 2 },
    ],
  });
  assert.equal(result.success, false);
});

test("Progress requires at least one changed field", () => {
  assert.equal(updateProgressSchema.safeParse({}).success, false);
  assert.equal(
    updateProgressSchema.safeParse({ completed: true }).success,
    true,
  );
});

test("Assignment submission requires content or file", () => {
  assert.equal(submitAssignmentSchema.safeParse({}).success, false);
  assert.equal(
    submitAssignmentSchema.safeParse({ content: "My answer" }).success,
    true,
  );
});
