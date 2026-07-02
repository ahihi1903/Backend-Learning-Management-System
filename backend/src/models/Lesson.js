// models/Lesson.js
import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, default: "" },
    videoUrl: { type: String, default: null },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    order: { type: Number, default: 0 }, // thứ tự bài học trong course
  },
  { timestamps: true },
);

lessonSchema.index({ course: 1, order: 1 }); // query lesson theo course, sort theo order

export default mongoose.model("Lesson", lessonSchema);

//order quan trọng — course có nhiều lesson cần hiển thị đúng thứ tự (Lesson 1, 2, 3...), không phải theo createdAt.
