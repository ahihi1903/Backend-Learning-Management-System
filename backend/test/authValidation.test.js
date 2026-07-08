import test from "node:test";
import assert from "node:assert/strict";
import {
  googleLoginSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../src/validations/authValidation.js";

test("register normalizes email and username", () => {
  const result = registerSchema.parse({
    username: "  student01  ",
    email: "  Student@Example.COM ",
    password: "StrongPass1",
  });

  assert.equal(result.username, "student01");
  assert.equal(result.email, "student@example.com");
});

test("register rejects a weak password", () => {
  const result = registerSchema.safeParse({
    username: "student01",
    email: "student@example.com",
    password: "password",
  });

  assert.equal(result.success, false);
});

test("login requires a password", () => {
  const result = loginSchema.safeParse({
    email: "student@example.com",
    password: "",
  });

  assert.equal(result.success, false);
});

test("reset password accepts a strong password and token", () => {
  const result = resetPasswordSchema.safeParse({
    token: "reset-token",
    newPassword: "NewStrongPass2",
  });

  assert.equal(result.success, true);
});

test("email verification accepts a secure token and keeps legacy OTP compatibility", () => {
  assert.equal(verifyEmailSchema.safeParse({ token: "a".repeat(64) }).success, true);
  assert.equal(verifyEmailSchema.safeParse({ token: "short" }).success, false);
  assert.equal(verifyEmailSchema.safeParse({ otp: "123456" }).success, true);
  assert.equal(verifyEmailSchema.safeParse({ otp: "12345" }).success, false);
});

test("google login requires a credential", () => {
  assert.equal(
    googleLoginSchema.safeParse({ credential: "short-token" }).success,
    false,
  );
  assert.equal(
    googleLoginSchema.safeParse({ code: "short-code" }).success,
    false,
  );
  assert.equal(
    googleLoginSchema.safeParse({ credential: "x".repeat(100) }).success,
    true,
  );
  assert.equal(
    googleLoginSchema.safeParse({ code: "4/".padEnd(80, "x") }).success,
    true,
  );
});
