import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../src/config/database.js";
import { validateEnv } from "../src/config/env.js";
import { seedDemoData } from "../src/services/demoSeedService.js";

validateEnv();
await connectDB();

try {
  const result = await seedDemoData();
  console.log("Demo data đã sẵn sàng:", result);
} finally {
  await mongoose.disconnect();
}
