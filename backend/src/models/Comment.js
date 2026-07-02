// models/Comment.js
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    content: { type: String, required: true, trim: true },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },

    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null, // hỗ trợ reply comment, null = comment gốc
    },
  },
  { timestamps: true },
);

commentSchema.index({ lesson: 1, createdAt: -1 }); // lấy comment mới nhất trước

export default mongoose.model("Comment", commentSchema);

//parentComment cho phép reply — nếu chưa cần thiết thì bỏ field này đi, đừng over-engineer ngay từ đầu. Thêm sau khi cần cũng không khó.
