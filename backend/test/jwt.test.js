import test from "node:test";
import assert from "node:assert/strict";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  verifyToken,
} from "../src/utils/jwt.js";

process.env.JWT_ACCESS_SECRET = "test-access-secret-with-enough-entropy";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-with-enough-entropy";

const user = { id: "507f1f77bcf86cd799439011", username: "student", role: "student" };

test("access token contains the current identity claims", () => {
  const token = generateAccessToken(user);
  const payload = verifyToken(token);

  assert.equal(payload.id, user.id);
  assert.equal(payload.role, user.role);
  assert.equal(payload.username, user.username);
});

test("refresh tokens are unique and verifiable", () => {
  const first = generateRefreshToken(user);
  const second = generateRefreshToken(user);

  assert.notEqual(first, second);
  assert.equal(verifyRefreshToken(first).id, user.id);
  assert.equal(verifyRefreshToken(second).id, user.id);
});

test("invalid tokens are rejected", () => {
  assert.equal(verifyToken("invalid").error, true);
  assert.equal(verifyRefreshToken("invalid"), null);
});
