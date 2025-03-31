import mongoose, { Schema, Document, Types } from "mongoose";
import Department from "./departmentSchema";

interface UserDocument extends Document {
  email: string;
  password: string;
  role: string;
  nationalId: string;
  titleName?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  startDate: Date;
  department: Types.ObjectId;
  status: string;
  createdBy?: {
    userId: Types.ObjectId | string;
    name: string;
  };
  confirmedBy?: {
    userId: Types.ObjectId | string;
    name: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
  otp?: string;
  otpREF?: string;
  otpExpires?: number;
  lastOtpSentTime: Date | null;
  policyAccepted: Date | null;
}

const UserSchema = new Schema<UserDocument>({
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["super_admin", "head_admin", "admin", "employee"],
    required: true,
  },
  nationalId: { type: String, required: true },
  titleName: { type: String, enum: ["นาย", "นาง", "นางสาว", "อื่นๆ"] },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: String },
  startDate: { type: Date },
  department: {
    type: Schema.Types.ObjectId,
    ref: Department,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive", "deleted"],
    required: true,
  },
  createdBy: {
    type: {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      name: { type: String },
    },
    required: true,
  },
  confirmedBy: {
    type: {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      name: { type: String },
    },
    default: null,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  otp: { type: String },
  otpREF: { type: String },
  otpExpires: { type: Number },
  lastOtpSentTime: { type: Date, default: null },
  policyAccepted: { type: Date, default: null },
});

export default mongoose.model<UserDocument>("User", UserSchema);
