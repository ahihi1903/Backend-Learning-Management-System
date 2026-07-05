import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    options: {
      type: [String],
      required: true,
      validate: (value) => value.length >= 2,
    },
    correctOption: { type: Number, required: true, min: 0 },
    points: { type: Number, default: 1, min: 1 },
  },
  { _id: true },
);

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questions: { type: [questionSchema], required: true },
    passingScore: { type: Number, default: 60, min: 0, max: 100 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true },
);

quizSchema.index({ lesson: 1, isPublished: 1 });

export default mongoose.model("Quiz", quizSchema);
