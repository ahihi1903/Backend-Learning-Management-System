import nodemailer from "nodemailer";

const BREVO_TRANSACTIONAL_EMAIL_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

let transporter;

function numberEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function booleanEnv(name, fallback) {
  const value = process.env[name];
  if (value === undefined) return fallback;
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

function cleanPassword(value) {
  return value?.replace(/\s/g, "");
}

function emailProvider() {
  const configured = process.env.EMAIL_PROVIDER?.trim().toLowerCase();
  if (configured) return configured;
  return process.env.BREVO_API_KEY?.trim() || process.env.SENDINBLUE_API_KEY?.trim()
    ? "brevo"
    : "smtp";
}

function parseResponseBody(text) {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function senderDetails() {
  const configuredFrom =
    process.env.EMAIL_FROM?.trim() ||
    process.env.BREVO_SENDER_EMAIL?.trim() ||
    process.env.EMAIL_USER?.trim();
  const configuredName =
    process.env.EMAIL_FROM_NAME?.trim() ||
    process.env.BREVO_SENDER_NAME?.trim() ||
    "Northstar Learning";

  if (!configuredFrom) {
    throw new Error("EMAIL_FROM hoặc BREVO_SENDER_EMAIL chưa được cấu hình");
  }

  const match = configuredFrom.match(/^(?:"?([^"<]*)"?\s*)?<([^>]+)>$/);
  if (match) {
    return {
      name: configuredName || match[1]?.trim() || "Northstar Learning",
      email: match[2].trim(),
    };
  }

  return {
    name: configuredName,
    email: configuredFrom,
  };
}

function formatSender() {
  const sender = senderDetails();
  const safeName = sender.name.replace(/"/g, "'");
  return `"${safeName}" <${sender.email}>`;
}

function recipients(to) {
  const values = Array.isArray(to) ? to : [to];
  return values.map((recipient) => {
    if (typeof recipient === "string") return { email: recipient };
    return {
      email: recipient.email,
      ...(recipient.name ? { name: recipient.name } : {}),
    };
  });
}

function getTransporter() {
  if (transporter) return transporter;
  const user = process.env.EMAIL_USER?.trim();
  const pass = cleanPassword(process.env.EMAIL_PASS);
  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = numberEnv("SMTP_PORT", 587);
  const secure = booleanEnv("SMTP_SECURE", port === 465);

  if (!user || !pass) {
    throw new Error("EMAIL_USER và EMAIL_PASS chưa được cấu hình");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure,
    connectionTimeout: numberEnv("SMTP_CONNECTION_TIMEOUT", 30_000),
    greetingTimeout: numberEnv("SMTP_GREETING_TIMEOUT", 15_000),
    socketTimeout: numberEnv("SMTP_SOCKET_TIMEOUT", 30_000),
    auth: { user, pass },
    tls: {
      minVersion: "TLSv1.2",
      servername: host,
    },
  });
  return transporter;
}

async function sendWithSmtp(to, subject, html) {
  return getTransporter().sendMail({
    from: formatSender(),
    to,
    subject,
    html,
  });
}

async function sendWithBrevo(to, subject, html) {
  const apiKey =
    process.env.BREVO_API_KEY?.trim() || process.env.SENDINBLUE_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("BREVO_API_KEY chưa được cấu hình");
  }

  const response = await fetch(BREVO_TRANSACTIONAL_EMAIL_ENDPOINT, {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: senderDetails(),
      to: recipients(to),
      subject,
      htmlContent: html,
    }),
  });

  const body = parseResponseBody(await response.text());
  if (!response.ok) {
    const error = new Error(
      body.message || body.error || `Brevo API trả về HTTP ${response.status}`,
    );
    error.provider = "brevo";
    error.status = response.status;
    error.response = body;
    throw error;
  }

  return body;
}

export async function sendEmail(to, subject, html) {
  const provider = emailProvider();

  if (provider === "brevo") {
    return sendWithBrevo(to, subject, html);
  }
  if (provider === "smtp") {
    return sendWithSmtp(to, subject, html);
  }

  throw new Error(`EMAIL_PROVIDER không được hỗ trợ: ${provider}`);
}
