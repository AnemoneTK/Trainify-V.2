import mongoose, { Schema, Document } from "mongoose";

interface LogDocument extends Document {
  userId: object;
  email: string;
  reason: string;
  ip: string;
  logoutAt: Date;
}
const LogoutLogSchema = new Schema<LogDocument>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User ",
    required: true,
  },
  email: { type: String, required: true },
  reason: { type: String, required: true },
  ip: { type: String },
  logoutAt: { type: Date, default: Date.now },
});

export default mongoose.model<LogDocument>("LogoutLog", LogoutLogSchema);
