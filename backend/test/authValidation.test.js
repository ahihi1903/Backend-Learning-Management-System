import test from "node:test";
import assert from "node:assert/strict";
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
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
