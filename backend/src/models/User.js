// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      default: null,
      select: false,
      required() {
        return !this.googleId;
      },
    },

    role: {
      type: String,
      enum: ["admin", "teacher", "student"],
      default: "student",
    },

    isVerified: { type: Boolean, default: false },
    verifyToken: { type: String, select: false },
    verifyTokenExpire: { type: Date, select: false },
    verifyOtpAttempts: { type: Number, default: 0, select: false },
    verifyOtpLastSentAt: { type: Date, default: null, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },
    refreshToken: { type: String, default: null, select: false },
    googleId: { type: String, select: false },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    avatar: { type: String, default: null },
  },
  { timestamps: true },
);

userSchema.index(
  { googleId: 1 },
  {
    unique: true,
    partialFilterExpression: { googleId: { $type: "string" } },
  },
);

export default mongoose.model("User", userSchema);
