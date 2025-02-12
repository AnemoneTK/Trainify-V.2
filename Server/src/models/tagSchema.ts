// models/Tag.ts
import mongoose, { Schema, Document } from "mongoose";

export interface TagDocument extends Document {
  name: string;
}

const TagSchema = new Schema<TagDocument>({
  name: { type: String, required: true },
});

// Mongoose จะสร้าง field _id ให้เราอัตโนมัติ
export default mongoose.model<TagDocument>("Tag", TagSchema);
