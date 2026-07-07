import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER và EMAIL_PASS chưa được cấu hình");
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
    connectionTimeout: 8_000,
    greetingTimeout: 5_000,
    socketTimeout: 10_000,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  return transporter;
}

export async function sendEmail(to, subject, html) {
  return getTransporter().sendMail({
    from: `"Northstar Learning" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}
