import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
import { initSuperAdmin } from "../utils/initSuperAdmin";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URL as string);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    // await initSuperAdmin();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

export default connectDB;
