import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import session from "express-session";
import mongoose from "mongoose";
import { config } from "./config/env";
import { sessionConfig } from "./config/session";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

// สร้าง Express application
const app = express();
const PORT = config.PORT || 3000;

// Middlewares
app.use(helmet());
app.use(
  cors({
    origin: config.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session(sessionConfig));

// เชื่อมต่อฐานข้อมูล
mongoose
  .connect(config.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// กำหนด Routes
app.use("/api", routes);

// Error handling middleware
app.use(errorHandler);

// เริ่มต้น Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
