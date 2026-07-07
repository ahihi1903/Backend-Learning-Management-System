import test from "node:test";
import assert from "node:assert/strict";
import createError from "../src/middlewares/createError.js";
import errorHandler from "../src/middlewares/errorHandler.js";

function mockResponse() {
  return {
    statusCode: undefined,
    body: undefined,
    status(value) {
      this.statusCode = value;
      return this;
    },
    json(value) {
      this.body = value;
      return this;
    },
  };
}

function mockRequest() {
  return {
    id: "test-request-id",
    method: "POST",
    originalUrl: "/api/auth/register",
  };
}

test("production error handler exposes safe operational errors", () => {
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";

  try {
    const res = mockResponse();
    const error = createError(503, "Không thể gửi OTP tới email này", {
      expose: true,
    });

    errorHandler(error, mockRequest(), res);

    assert.equal(res.statusCode, 503);
    assert.equal(res.body.message, "Không thể gửi OTP tới email này");
    assert.equal(res.body.requestId, "test-request-id");
  } finally {
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
  }
});

test("production error handler masks unexpected server errors", () => {
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";

  try {
    const res = mockResponse();

    errorHandler(new Error("database secret exploded"), mockRequest(), res);

    assert.equal(res.statusCode, 500);
    assert.equal(res.body.message, "Internal Server Error");
  } finally {
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
  }
});
