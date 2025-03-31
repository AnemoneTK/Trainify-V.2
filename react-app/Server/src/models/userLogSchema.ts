import mongoose, { Schema, Document, Types } from "mongoose";

interface UserLogDocument extends Document {
  action: string;
  userId: Types.ObjectId | string;
  performedBy: { userId: Types.ObjectId | string; name: string };
  changes?: Record<string, any>;
  timestamp: Date;
}

const UserLogSchema = new Schema<UserLogDocument>({
  action: {
    type: String,
    enum: ["create", "update", "delete", "change_status", "confirmed", "other"],
    required: true,
  },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  performedBy: {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
  },
  changes: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model<UserLogDocument>("UserLog", UserLogSchema);
