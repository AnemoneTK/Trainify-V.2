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
  tag: string[];
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

const CourseSchema = new Schema<CourseDocument>({
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
    start: { type: Date, required: true }, // วันเริ่มเปิดรับสมัคร
    end: { type: Date, required: true }, // วันสิ้นสุดรับสมัคร
  },
  place: {
    description: { type: String }, // ข้อความบอกสถานที่
    mapUrl: { type: String }, // URL Google Map (ไม่บังคับ)
  },
  type: {
    type: String,
    enum: ["offline", "online"], // ประเภทหลักสูตร
    required: true,
  },
  instructors: [{ type: String, required: true }], // รายชื่อวิทยากรในรูปแบบ Array
  tag: [{ type: String }], // แท็กสำหรับหลักสูตร
  status: {
    type: String,
    enum: ["save", "public", "deleted", "close"], // สถานะของหลักสูตร
    required: true,
  },
  banner: { type: String }, // Path หรือ URL ของแบนเนอร์
  createdBy: {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // ID ของผู้สร้างหลักสูตร
    fullName: { type: String, required: true }, // ชื่อเต็มของผู้สร้าง
    role: { type: String, required: true }, // บทบาทของผู้สร้าง
  },
  createdAt: { type: Date, default: Date.now }, // วันที่สร้างหลักสูตร
  updatedAt: { type: Date, default: Date.now }, // วันที่อัปเดตล่าสุด
});

export default mongoose.model<CourseDocument>("Course", CourseSchema);
