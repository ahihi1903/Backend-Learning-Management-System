import mongoose from "mongoose";

const assignmentSubmissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, default: "" },
    fileUrl: { type: String, default: null },
    status: {
      type: String,
      enum: ["submitted", "graded"],
      default: "submitted",
    },
    score: { type: Number, default: null, min: 0 },
    feedback: { type: String, default: "" },
    submittedAt: { type: Date, default: Date.now },
    gradedAt: { type: Date, default: null },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

assignmentSubmissionSchema.index(
  { assignment: 1, user: 1 },
  { unique: true },
);

export default mongoose.model("AssignmentSubmission", assignmentSubmissionSchema);
