import mongoose from "mongoose";
import UserAccount from "../models/UserAccount";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function seedAdmin() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error("Error: MONGO_URI environment variable is not defined in .env or .env.local.");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully.");

    // Check if admin already exists
    const existingAdmin = await UserAccount.findOne({ username: "admin" });
    if (existingAdmin) {
      console.log("\n-------------------------------------");
      console.log("Admin account already exists in database.");
      console.log("Username: admin");
      console.log("Role: institution_admin");
      console.log("-------------------------------------\n");
      process.exit(0);
    }

    // Default secure credentials
    const password = "SonaAdmin2026!";
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await UserAccount.create({
      username: "admin",
      password: hashedPassword,
      role: "institution_admin",
      institutionId: new mongoose.Types.ObjectId(),
      fullName: "Sona System Administrator",
      email: "admin@sonascale.edu",
      isActive: true,
      createdBy: "seeder",
    });

    console.log("\n-------------------------------------");
    console.log("SUCCESS: Default Admin credentials created!");
    console.log(`Username: admin`);
    console.log(`Password: ${password}`);
    console.log(`Role: ${newAdmin.role}`);
    console.log("-------------------------------------\n");

  } catch (error) {
    console.error("Error seeding administrator account:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  }
}

seedAdmin();
