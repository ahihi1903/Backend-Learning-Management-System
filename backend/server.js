import "dotenv/config";

import app from "./app.js";
// import dotenv from "dotenv";
// dotenv.config();

import connectDB from "./src/config/database.js";
import { validateEnv } from "./src/config/env.js";
import mongoose from "mongoose";
import { seedDemoData } from "./src/services/demoSeedService.js";

const { port } = validateEnv();
await connectDB();
if (process.env.AUTO_SEED_DEMO === "true") {
  const demo = await seedDemoData();
  console.log("Demo data ready", demo);
}

const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

let shuttingDown = false;
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received, shutting down gracefully`);

  const forceExit = setTimeout(() => process.exit(1), 10_000);
  forceExit.unref();

  server.close(async () => {
    await mongoose.disconnect();
    clearTimeout(forceExit);
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
