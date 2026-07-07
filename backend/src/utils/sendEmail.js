import nodemailer from "nodemailer";

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

function getTransporter() {
  if (transporter) return transporter;
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.replace(/\s/g, "");
  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = numberEnv("SMTP_PORT", 587);
  const secure = booleanEnv("SMTP_SECURE", port === 465);
  const connectionTimeout = numberEnv("SMTP_CONNECTION_TIMEOUT", 30_000);
  const greetingTimeout = numberEnv("SMTP_GREETING_TIMEOUT", 15_000);
  const socketTimeout = numberEnv("SMTP_SOCKET_TIMEOUT", 30_000);

  if (!user || !pass) {
    throw new Error("EMAIL_USER và EMAIL_PASS chưa được cấu hình");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure,
    connectionTimeout,
    greetingTimeout,
    socketTimeout,
    auth: {
      user,
      pass,
    },
    tls: {
      minVersion: "TLSv1.2",
      servername: host,
    },
  });
  return transporter;
}

export async function sendEmail(to, subject, html) {
  const user = process.env.EMAIL_USER?.trim();
  const fromName = process.env.EMAIL_FROM_NAME?.trim() || "Northstar Learning";
  const fromAddress = process.env.EMAIL_FROM?.trim() || user;

  return getTransporter().sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to,
    subject,
    html,
  });
}
