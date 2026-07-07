import test from "node:test";
import assert from "node:assert/strict";
import { sendEmail } from "../src/utils/sendEmail.js";

const ENV_KEYS = [
  "EMAIL_PROVIDER",
  "BREVO_API_KEY",
  "SENDINBLUE_API_KEY",
  "EMAIL_FROM",
  "EMAIL_FROM_NAME",
  "BREVO_SENDER_EMAIL",
  "BREVO_SENDER_NAME",
  "EMAIL_USER",
  "EMAIL_PASS",
];

function snapshotEnv() {
  return Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));
}

function restoreEnv(snapshot) {
  for (const key of ENV_KEYS) {
    if (snapshot[key] === undefined) delete process.env[key];
    else process.env[key] = snapshot[key];
  }
}

test("sendEmail sends through Brevo API when EMAIL_PROVIDER=brevo", async () => {
  const env = snapshotEnv();
  const originalFetch = globalThis.fetch;

  process.env.EMAIL_PROVIDER = "brevo";
  process.env.BREVO_API_KEY = "xkeysib_test_key";
  process.env.EMAIL_FROM = "Northstar Learning <sender@example.com>";
  process.env.EMAIL_FROM_NAME = "Northstar Learning";
  delete process.env.SENDINBLUE_API_KEY;

  try {
    globalThis.fetch = async (url, options) => {
      assert.equal(url, "https://api.brevo.com/v3/smtp/email");
      assert.equal(options.method, "POST");
      assert.equal(options.headers.accept, "application/json");
      assert.equal(options.headers["api-key"], "xkeysib_test_key");
      assert.equal(options.headers["Content-Type"], "application/json");

      const payload = JSON.parse(options.body);
      assert.deepEqual(payload.sender, {
        name: "Northstar Learning",
        email: "sender@example.com",
      });
      assert.deepEqual(payload.to, [{ email: "student@example.com" }]);
      assert.equal(payload.subject, "OTP");
      assert.equal(payload.htmlContent, "<p>123456</p>");

      return new Response(JSON.stringify({ messageId: "brevo_message_123" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    };

    const result = await sendEmail("student@example.com", "OTP", "<p>123456</p>");
    assert.equal(result.messageId, "brevo_message_123");
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnv(env);
  }
});

test("sendEmail surfaces Brevo API errors", async () => {
  const env = snapshotEnv();
  const originalFetch = globalThis.fetch;

  process.env.EMAIL_PROVIDER = "brevo";
  process.env.BREVO_API_KEY = "xkeysib_test_key";
  process.env.EMAIL_FROM = "Northstar Learning <sender@example.com>";

  try {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ code: "unauthorized", message: "Key not found" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });

    await assert.rejects(
      () => sendEmail("student@example.com", "OTP", "<p>123456</p>"),
      (error) => {
        assert.equal(error.provider, "brevo");
        assert.equal(error.status, 401);
        assert.match(error.message, /Key not found/);
        assert.deepEqual(error.response, {
          code: "unauthorized",
          message: "Key not found",
        });
        return true;
      },
    );
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnv(env);
  }
});

test("sendEmail uses Brevo automatically when BREVO_API_KEY is present", async () => {
  const env = snapshotEnv();
  const originalFetch = globalThis.fetch;

  delete process.env.EMAIL_PROVIDER;
  process.env.BREVO_API_KEY = "xkeysib_test_key";
  process.env.EMAIL_FROM = "sender@example.com";
  process.env.EMAIL_FROM_NAME = "Northstar Learning";

  try {
    globalThis.fetch = async (_url, options) => {
      const payload = JSON.parse(options.body);
      assert.deepEqual(payload.sender, {
        name: "Northstar Learning",
        email: "sender@example.com",
      });

      return new Response(JSON.stringify({ messageId: "auto_brevo_123" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    };

    const result = await sendEmail("student@example.com", "OTP", "<p>123456</p>");
    assert.equal(result.messageId, "auto_brevo_123");
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnv(env);
  }
});
