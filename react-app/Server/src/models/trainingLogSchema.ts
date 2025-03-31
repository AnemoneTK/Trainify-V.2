import mongoose, { Schema, Document, Types } from "mongoose";

interface TrainingLogDocument extends Document {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  enrollmentId: Types.ObjectId;
  action: string;
  previousStatus: string;
  newStatus: string;
  performedBy: Types.ObjectId;
  timestamp: Date;
  notes?: string;
}

const TrainingLogSchema = new Schema<TrainingLogDocument>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  enrollmentId: {
    type: Schema.Types.ObjectId,
    ref: "Enrollment",
    required: true,
  },
  action: {
    type: String,
    enum: ["enrolled", "completed", "cancelled", "status_changed"],
    required: true,
  },
  previousStatus: { type: String },
  newStatus: { type: String },
  performedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  timestamp: { type: Date, default: Date.now },
  notes: { type: String },
});

export default mongoose.model<TrainingLogDocument>(
  "TrainingLog",
  TrainingLogSchema
);
