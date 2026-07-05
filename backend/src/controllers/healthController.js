import mongoose from "mongoose";

export function live(req, res) {
  res.json({
    status: "ok",
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
}

export function ready(req, res) {
  const databaseReady = mongoose.connection.readyState === 1;
  res.status(databaseReady ? 200 : 503).json({
    status: databaseReady ? "ready" : "not_ready",
    database: databaseReady ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
}
