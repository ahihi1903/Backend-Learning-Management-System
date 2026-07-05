import test from "node:test";
import assert from "node:assert/strict";
import app from "../app.js";

test("health and security middleware work without database", async () => {
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, "127.0.0.1", () => resolve(instance));
  });

  try {
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    const live = await fetch(`${baseUrl}/health/live`);
    assert.equal(live.status, 200);
    assert.equal(live.headers.get("x-content-type-options"), "nosniff");
    assert.equal(live.headers.get("x-frame-options"), "DENY");
    assert.equal(live.headers.has("x-powered-by"), false);
    assert.ok(live.headers.get("x-request-id"));

    const ready = await fetch(`${baseUrl}/health/ready`);
    assert.equal(ready.status, 503);

    const invalidId = await fetch(`${baseUrl}/api/courses/not-an-object-id`);
    assert.equal(invalidId.status, 400);

    const missingRoute = await fetch(`${baseUrl}/api/not-found`);
    assert.equal(missingRoute.status, 404);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
