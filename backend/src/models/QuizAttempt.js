import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answers: { type: [Number], required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    earnedPoints: { type: Number, required: true, min: 0 },
    totalPoints: { type: Number, required: true, min: 1 },
    passed: { type: Boolean, required: true },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

quizAttemptSchema.index({ quiz: 1, user: 1, createdAt: -1 });

export default mongoose.model("QuizAttempt", quizAttemptSchema);
