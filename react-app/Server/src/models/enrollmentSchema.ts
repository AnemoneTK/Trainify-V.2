import mongoose, { Schema, Document, Types } from "mongoose";

interface EnrollmentDocument extends Document {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  status: string;
  enrollmentDate: Date;
  completionDate?: Date;
  attendance?: boolean;
  verificationCode: string;
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema = new Schema<EnrollmentDocument>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed", "failed", "cancelled"],
    required: true,
  },
  enrollmentDate: { type: Date, default: Date.now },
  completionDate: { type: Date },
  attendance: { type: Boolean },
  verificationCode: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<EnrollmentDocument>(
  "Enrollment",
  EnrollmentSchema
);
