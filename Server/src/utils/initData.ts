import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import TagSchema from "../models/tagSchema";
import DepartmentSchema from "../models/departmentSchema";
import UserSchema from "../models/userSchema";
import { bcrypt, encryptData } from "./constants";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const email = process.env.SUPER_ADMIN_EMAIL as string;
const pass = process.env.SUPER_ADMIN_PASSWORD as string;
const phone = process.env.SUPER_ADMIN_PHONE as string;

// Define the initial tags for courses
const initialTags = [
  { name: "Web Development" },
  { name: "Database" },
  { name: "Network Security" },
  { name: "Cloud Computing" },
  { name: "Soft Skills" },
  { name: "Project Management" },
  { name: "Leadership" },
  { name: "UI/UX Design" },
  { name: "Data Science" },
];

// Define the initial departments
const initialDepartments = [
  { name: "Information Technology" },
  { name: "Human Resources" },
  { name: "Finance" },
  { name: "Marketing" },
  { name: "Operations" },
  { name: "Research & Development" },
  { name: "Customer Support" },
  { name: "Sales" },
  { name: "Legal" },
];

// Function to initialize Super Admin
export const initSuperAdmin = async () => {
  try {
    // Check if super admin exists
    const existingSuperAdmin = await UserSchema.findOne({
      role: "super_admin",
    });

    if (!existingSuperAdmin) {
      console.log("No super admin found. Creating one...");

      const encryptedEmail = encryptData(email.toLowerCase());
      const encryptedPhoneNumber = encryptData(phone);
      const encryptedNationalId = encryptData(pass);
      const hashedPassword = await bcrypt.hash(pass, 10);

      const superAdmin = new UserSchema({
        first_name: "Super",
        last_name: "Admin",
        nationalId: encryptedNationalId,
        email: encryptedEmail,
        password: hashedPassword,
        role: "super_admin",
        department: "Information Technology",
        isVerified: true,
        isAcceptPolicy: true,
        status: "active",
      });

      await superAdmin.save();
      console.log("Super admin created successfully");
    } else {
      console.log("Super admin already exists");
    }
  } catch (error) {
    console.error("Error initializing super admin:", error);
  }
};

// Function to initialize tags
export const initTags = async () => {
  try {
    // Check if any tags exist
    const existingTagsCount = await TagSchema.countDocuments();

    if (existingTagsCount === 0) {
      console.log("No tags found. Initializing tags...");

      // Insert all initial tags
      await TagSchema.insertMany(initialTags);

      console.log(`${initialTags.length} tags created successfully`);
    } else {
      console.log(
        `${existingTagsCount} tags already exist, skipping initialization`
      );
    }
  } catch (error) {
    console.error("Error initializing tags:", error);
  }
};

// Function to initialize departments
export const initDepartments = async () => {
  try {
    // Check if any departments exist
    const existingDepartmentsCount = await DepartmentSchema.countDocuments();

    if (existingDepartmentsCount === 0) {
      console.log("No departments found. Initializing departments...");

      // Insert all initial departments
      await DepartmentSchema.insertMany(initialDepartments);

      console.log(
        `${initialDepartments.length} departments created successfully`
      );
    } else {
      console.log(
        `${existingDepartmentsCount} departments already exist, skipping initialization`
      );
    }
  } catch (error) {
    console.error("Error initializing departments:", error);
  }
};

// Main function to initialize all data
export const initializeData = async () => {
  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.DATABASE_URL as string);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Initialize all data types
    await initSuperAdmin();
    await initTags();
    await initDepartments();

    console.log("Data initialization completed");

    // Close the connection if this script is run standalone
    if (require.main === module) {
      mongoose.disconnect();
    }
  } catch (error) {
    console.error("Error during data initialization:", error);
    if (require.main === module) {
      process.exit(1);
    }
  }
};

// If this file is run directly (not imported), run the initialization
if (require.main === module) {
  initializeData();
}
