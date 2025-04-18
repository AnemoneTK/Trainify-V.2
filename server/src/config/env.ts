// server / src / config / env.ts;
import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../../ .env") });

// ตรวจสอบความจำเป็นของตัวแปรสภาพแวดล้อม
const requiredEnvVars = ["MONGODB_URI", "SESSION_SECRET"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: Environment variable ${envVar} is missing`);
    process.exit(1);
  }
}

export const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "3000", 10),
  MONGODB_URI: process.env.MONGODB_URI as string,
  SESSION_SECRET: process.env.SESSION_SECRET as string,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
};
