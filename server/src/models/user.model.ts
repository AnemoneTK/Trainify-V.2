import mongoose, { Schema, Document } from "mongoose";

export interface UserDocument extends Document {
  email: string;
  password: string;
  role: string;
  nationalId: string;
  titleName?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  department: mongoose.Types.ObjectId;
  status: string;
  otp?: string;
  otpREF?: string;
  otpExpires?: number;
  lastOtpSentTime?: Date;
  policyAccepted?: Date;
  createdBy?: {
    userId: mongoose.Types.ObjectId;
    name: string;
  };
  confirmedBy?: {
    userId: mongoose.Types.ObjectId;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["super_admin", "admin", "employee"],
      required: true,
    },
    nationalId: { type: String, required: true },
    titleName: { type: String, enum: ["นาย", "นาง", "นางสาว", "อื่นๆ"] },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "deleted"],
      required: true,
    },
    otp: { type: String },
    otpREF: { type: String },
    otpExpires: { type: Number },
    lastOtpSentTime: { type: Date, default: null },
    policyAccepted: { type: Date, default: null },
    createdBy: {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      name: { type: String },
    },
    confirmedBy: {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      name: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.model<UserDocument>("User", UserSchema);
