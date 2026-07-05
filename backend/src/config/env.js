const REQUIRED = ["MONGO_URI", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];

export function validateEnv() {
  const missing = REQUIRED.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Thiếu biến môi trường: ${missing.join(", ")}`);
  }

  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT không hợp lệ");
  }

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
  }

  return { port };
}
