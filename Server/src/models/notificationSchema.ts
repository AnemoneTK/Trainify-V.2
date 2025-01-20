import mongoose, { Schema, Document, Types } from "mongoose";

interface NotificationDocument extends Document {
  userId: Types.ObjectId;
  type: string;
  title: string;
  message: string;
  status: string;
  sendDate: Date;
  sentDate?: Date;
  createdAt: Date;
}

const NotificationSchema = new Schema<NotificationDocument>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: ["course_reminder", "completion_alert", "status_update"],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "sent", "failed"],
    default: "pending",
  },
  sendDate: { type: Date },
  sentDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<NotificationDocument>(
  "Notification",
  NotificationSchema
);
