import mongoose, { Schema, Document } from "mongoose";

interface DepartmentDocument extends Document {
  name: string;
}

const DepartmentSchema = new Schema<DepartmentDocument>({
  name: {
    type: String,
    unique: true,
  },
});

export default mongoose.model<DepartmentDocument>(
  "Department",
  DepartmentSchema
);
