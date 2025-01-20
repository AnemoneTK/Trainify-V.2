import mongoose, { Schema, Document } from "mongoose";

interface LogDocument extends Document {
  userId: object;
  email: string;
  success: Boolean;
  ip: string;
  createdAt: Date;
}
const LoginLogSchema = new Schema<LogDocument>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User ",
    required: true,
  },
  email: { type: String, required: true },
  success: { type: Boolean, required: true },
  ip: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<LogDocument>("LoginLog", LoginLogSchema);
