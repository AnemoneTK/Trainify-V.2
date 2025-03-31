import mongoose, { Schema, Document, Types } from "mongoose";

interface PermissionDocument extends Document {
  role: string;
  permissions: {
    resource: string;
    actions: string[]; // เช่น "create", "read", "update", "delete"
  }[];
}

const PermissionSchema = new Schema<PermissionDocument>({
  role: { type: String, unique: true, required: true },
  permissions: [
    {
      resource: { type: String, required: true },
      actions: [
        {
          type: String,
          enum: ["create", "read", "update", "delete"],
          required: true,
        },
      ],
    },
  ],
});

export default mongoose.model<PermissionDocument>(
  "Permission",
  PermissionSchema
);
