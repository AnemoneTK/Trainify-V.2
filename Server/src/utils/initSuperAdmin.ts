// src/utils/initSuperAdmin.ts
import { UserSchema, encryptData, bcrypt } from "./constants";
import dotenv from "dotenv";

const User = UserSchema;

// Load environment variables
dotenv.config();

export const initSuperAdmin = async (): Promise<void> => {
  try {
    console.log("Checking for existing Super Admin account...");

    // Check if any Super Admin already exists
    const existingSuperAdmin = await User.findOne({ role: "super_admin" });

    if (existingSuperAdmin) {
      console.log(
        "Super Admin account already exists. Skipping initialization."
      );
      return;
    }

    // Get credentials from environment variables
    const email = process.env.SUPER_ADMIN_EMAIL;
    const password = process.env.SUPER_ADMIN_PASSWORD;
    const firstName = process.env.SUPER_ADMIN_FIRST_NAME || "Super";
    const lastName = process.env.SUPER_ADMIN_LAST_NAME || "Admin";
    const phoneNumber = process.env.SUPER_ADMIN_PHONE || "0000000000";

    if (!email || !password) {
      throw new Error(
        "SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD environment variables must be set"
      );
    }

    // Encrypt user data
    const encryptedEmail = encryptData(email.toLowerCase());
    const encryptedFirstName = encryptData(firstName);
    const encryptedLastName = encryptData(lastName);
    const encryptedPhoneNumber = encryptData(phoneNumber);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the Super Admin user
    const superAdmin = new User({
      email: encryptedEmail,
      password: hashedPassword,
      role: "super_admin",
      titleName: "นาย",
      firstName: encryptedFirstName,
      lastName: encryptedLastName,
      phoneNumber: encryptedPhoneNumber,
      status: "active",
      policyAccepted: new Date(), // Auto-accept policy for initial admin
      startDate: new Date(),
      createdBy: {
        userId: "system",
        name: "System Initialization",
      },
      confirmedBy: {
        userId: "system",
        name: "System Initialization",
      },
    });

    await superAdmin.save();
    console.log(`✅ Super Admin account created with email: ${email}`);
  } catch (error) {
    console.error("❌ Failed to initialize Super Admin account:", error);
  }
};
