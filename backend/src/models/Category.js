// models/Category.js
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.model("Category", categorySchema);

//slug dùng cho URL đẹp sau này (/courses?category=javascript-basics). Tạo tự động từ name trong service, không nhận từ client.
