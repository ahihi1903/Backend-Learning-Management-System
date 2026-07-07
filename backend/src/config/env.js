const REQUIRED = ["MONGO_URI", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];

function validatePort(name, fallback) {
  const value = Number(process.env[name] || fallback);
  if (!Number.isInteger(value) || value < 1 || value > 65535) {
    throw new Error(`${name} không hợp lệ`);
  }
  return value;
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
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("EMAIL_USER và EMAIL_PASS là bắt buộc ở production");
    }
    validatePort("SMTP_PORT", 587);
  }

  return { port };
}
