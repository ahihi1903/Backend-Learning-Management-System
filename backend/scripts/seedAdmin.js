import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../src/config/database.js";
import { validateEnv } from "../src/config/env.js";
import User from "../src/models/User.js";
import { hashPassword } from "../src/utils/hash.js";
import { registerSchema } from "../src/validations/authValidation.js";

validateEnv();

const parsed = registerSchema.safeParse({
  username: process.env.ADMIN_USERNAME,
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
});

if (!parsed.success) {
  console.error(
    `Thông tin admin không hợp lệ: ${parsed.error.issues[0]?.message}`,
  );
  process.exit(1);
}

await connectDB();

try {
  const adminExists = await User.exists({ role: "admin" });
  if (adminExists) {
    console.log("Admin đã tồn tại, không tạo thêm");
  } else {
    await User.create({
      username: parsed.data.username,
      email: parsed.data.email,
      password: await hashPassword(parsed.data.password),
      role: "admin",
      isVerified: true,
    });
    console.log("Tạo admin đầu tiên thành công");
  }
} finally {
  await mongoose.disconnect();
}
