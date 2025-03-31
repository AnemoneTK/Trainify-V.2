import mongoose, { Schema, Document, Types } from "mongoose";
import User from "./userSchema";

interface LogDocument extends Document {
  userId: Types.ObjectId;
  email: string;
  success: Boolean;
  ip: string;
  createdAt: Date;
}
const LoginLogSchema = new Schema<LogDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User", // Removed trailing space
    required: true,
  },
  email: { type: String, required: true },
  success: { type: Boolean, required: true },
  ip: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<LogDocument>("LoginLog", LoginLogSchema);
