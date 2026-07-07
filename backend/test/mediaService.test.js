import test from "node:test";
import assert from "node:assert/strict";
import {
  createVideoUploadSignature,
  optimizedVideoUrl,
} from "../src/services/mediaService.js";

test("video upload signature never exposes the API secret", () => {
  const previous = {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  };
  process.env.CLOUDINARY_CLOUD_NAME = "demo-cloud";
  process.env.CLOUDINARY_API_KEY = "public-key";
  process.env.CLOUDINARY_API_SECRET = "private-secret";

  try {
    const result = createVideoUploadSignature("teacher-id");
    assert.equal(result.cloudName, "demo-cloud");
    assert.equal(result.apiKey, "public-key");
    assert.equal(typeof result.signature, "string");
    assert.equal(JSON.stringify(result).includes("private-secret"), false);
  } finally {
    for (const [key, value] of Object.entries({
      CLOUDINARY_CLOUD_NAME: previous.cloudName,
      CLOUDINARY_API_KEY: previous.apiKey,
      CLOUDINARY_API_SECRET: previous.apiSecret,
    })) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test("Cloudinary video delivery URL receives automatic optimization", () => {
  assert.equal(
    optimizedVideoUrl(
      "https://res.cloudinary.com/demo/video/upload/v1/course/lesson.mp4",
    ),
    "https://res.cloudinary.com/demo/video/upload/q_auto:good,f_auto/v1/course/lesson.mp4",
  );
});
