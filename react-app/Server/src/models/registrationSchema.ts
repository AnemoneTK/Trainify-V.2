import mongoose, { Schema, Document } from "mongoose";
import { CourseDocument } from "./courseSchema";
interface RegistrationDocument extends Document {
  courseId: mongoose.Types.ObjectId | CourseDocument;
  userId: mongoose.Types.ObjectId;
  date: Date;
  timeSlot: { start: Date; end: Date };
  status:
    | "registered"
    | "cancelled"
    | "passed"
    | "failed"
    | "expire"
    | "extend"
    | "not-attended"
    | "wait";
  registeredAt: Date;
  passedAt?: Date;
  expiryDate?: Date;
}

const RegistrationSchema = new Schema<RegistrationDocument>({
  courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  timeSlot: {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
  },
  status: {
    type: String,
    enum: ["registered", "cancelled", "passed", "failed", "expire", "extend"],
    default: "registered",
  },
  registeredAt: { type: Date, default: Date.now },
  passedAt: { type: Date, default: null },
  expiryDate: { type: Date, default: null },
});

export default mongoose.model<RegistrationDocument>(
  "Registration",
  RegistrationSchema
);
