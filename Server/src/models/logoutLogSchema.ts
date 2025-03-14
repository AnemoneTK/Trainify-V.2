import mongoose, { Schema, Document, Types } from "mongoose";
import User from "./userSchema";

interface LogDocument extends Document {
  userId: Types.ObjectId;
  email: string;
  reason: string;
  ip: string;
  logoutAt: Date;
}
const LogoutLogSchema = new Schema<LogDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User", // Removed trailing space
    required: true,
  },
  email: { type: String, required: true },
  reason: { type: String, required: true },
  ip: { type: String },
  logoutAt: { type: Date, default: Date.now },
});

export default mongoose.model<LogDocument>("LogoutLog", LogoutLogSchema);
