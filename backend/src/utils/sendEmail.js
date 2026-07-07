import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.replace(/\s/g, "");

  if (!user || !pass) {
    throw new Error("EMAIL_USER và EMAIL_PASS chưa được cấu hình");
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    connectionTimeout: 8_000,
    greetingTimeout: 5_000,
    socketTimeout: 10_000,
    auth: {
      user,
      pass,
    },
  });
  return transporter;
}

export async function sendEmail(to, subject, html) {
  const from = process.env.EMAIL_USER?.trim();

  return getTransporter().sendMail({
    from: `"Northstar Learning" <${from}>`,
    to,
    subject,
    html,
  });
}
