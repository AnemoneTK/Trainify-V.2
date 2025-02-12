import mongoose, { Schema, Document, Types } from "mongoose";

interface CourseDocument extends Document {
  title: string;
  description: string;
  schedule: {
    date: Date;
    times: {
      start: Date;
      end: Date;
      seat: number;
      registeredSeats: number;
    }[];
  }[];
  dueDate: { start: Date; end: Date };
  place?: { description: string; mapUrl?: string };
  type: "offline" | "online";
  instructors: string[];
  tag: Types.ObjectId[]; // เปลี่ยนจาก string[] เป็น ObjectId[] เพื่ออ้างอิงกับ Tag
  status: string;
  banner?: string;
  createdBy: {
    userId: Types.ObjectId;
    fullName: string;
    role: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<CourseDocument>(
  {
    title: { type: String, required: true },
    description: { type: String },
    schedule: [
      {
        date: { type: Date, required: true },
        times: [
          {
            start: { type: Date, required: true },
            end: { type: Date, required: true },
            seat: { type: Number, required: true },
            registeredSeats: { type: Number, default: 0 },
          },
        ],
      },
    ],
    dueDate: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    place: {
      description: { type: String },
      mapUrl: { type: String },
    },
    type: {
      type: String,
      enum: ["offline", "online"],
      required: true,
    },
    instructors: [{ type: String, required: true }],
    // เปลี่ยน field tag ให้เป็น Array ของ ObjectId ที่อ้างอิงไปยัง collection "Tag"
    tag: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    status: {
      type: String,
      enum: ["save", "public", "deleted", "close"],
      required: true,
    },
    banner: { type: String },
    createdBy: {
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      fullName: { type: String, required: true },
      role: { type: String, required: true },
    },
  },
  { timestamps: true } // Mongoose จะจัดการ createdAt และ updatedAt อัตโนมัติ
);

export default mongoose.model<CourseDocument>("Course", CourseSchema);
