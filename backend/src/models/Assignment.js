import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    instructions: { type: String, required: true },
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
    dueDate: { type: Date, default: null },
    maxScore: { type: Number, default: 100, min: 1 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true },
);

assignmentSchema.index({ lesson: 1, isPublished: 1 });

export default mongoose.model("Assignment", assignmentSchema);
