//server/src/middlewares/upload.ts
import multer from "multer";
import path from "path";

// Set up storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, "../uploads/banners")); // Resolve the correct path
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`); // Generate a unique filename
  },
});

// Define file filter to validate uploads
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("ไฟล์ต้องเป็นรูปภาพเท่านั้น (JPEG, PNG, GIF)"), false);
  }
};

// Initialize multer with storage and filters
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
  },
});

export default upload;
