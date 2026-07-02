// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 20,
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["admin", "teacher", "student"],
      default: "student",
    },

    isVerified: { type: Boolean, default: false },
    verifyToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    refreshToken: { type: String, default: null }, // lưu DB thay vì RAM (theo audit trước)

    avatar: { type: String, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
