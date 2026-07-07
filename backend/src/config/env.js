const REQUIRED = ["MONGO_URI", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];
const SUPPORTED_EMAIL_PROVIDERS = new Set(["brevo", "smtp"]);

function validatePort(name, fallback) {
  const value = Number(process.env[name] || fallback);
  if (!Number.isInteger(value) || value < 1 || value > 65535) {
    throw new Error(`${name} không hợp lệ`);
  }
  return value;
}

function emailProvider() {
  const configured = process.env.EMAIL_PROVIDER?.trim().toLowerCase();
  if (configured) return configured;
  return process.env.BREVO_API_KEY?.trim() || process.env.SENDINBLUE_API_KEY?.trim()
    ? "brevo"
    : "smtp";
}

function hasBrevoSender() {
  return Boolean(process.env.EMAIL_FROM || process.env.BREVO_SENDER_EMAIL);
}

function validateEmailEnv() {
  const provider = emailProvider();
  if (!SUPPORTED_EMAIL_PROVIDERS.has(provider)) {
    throw new Error(`EMAIL_PROVIDER không được hỗ trợ: ${provider}`);
  }

  if (provider === "brevo") {
    if (!process.env.BREVO_API_KEY && !process.env.SENDINBLUE_API_KEY) {
      throw new Error("BREVO_API_KEY là bắt buộc khi EMAIL_PROVIDER=brevo");
    }
    if (!hasBrevoSender()) {
      throw new Error(
        "EMAIL_FROM hoặc BREVO_SENDER_EMAIL là bắt buộc khi EMAIL_PROVIDER=brevo",
      );
    }
    return;
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER và EMAIL_PASS là bắt buộc khi EMAIL_PROVIDER=smtp");
  }
  validatePort("SMTP_PORT", 587);
}

export function validateEnv() {
  const missing = REQUIRED.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Thiếu biến môi trường: ${missing.join(", ")}`);
  }

  const port = validatePort("PORT", 3000);

  if (process.env.NODE_ENV === "production") {
    for (const key of ["JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"]) {
      if (process.env[key].length < 32) {
        throw new Error(`${key} phải có ít nhất 32 ký tự ở production`);
      }
    }
    if (!process.env.FRONTEND_URL) {
      throw new Error("FRONTEND_URL là bắt buộc ở production");
    }
    validateEmailEnv();
  }

  return { port };
}
