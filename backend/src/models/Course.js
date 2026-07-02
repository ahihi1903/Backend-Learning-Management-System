// models/Course.js
import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3 },
    description: { type: String, required: true },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    thumbnail: { type: String, default: null },
    price: { type: Number, default: 0, min: 0 },

    isPublished: { type: Boolean, default: false }, // teacher có thể tạo draft trước
  },
  { timestamps: true },
);

courseSchema.index({ category: 1 });
courseSchema.index({ teacher: 1 });

export default mongoose.model("Course", courseSchema);

//isPublished là pattern thực tế hay gặp — teacher tạo course xong nhưng chưa public ngay, student chỉ thấy course đã publish.
