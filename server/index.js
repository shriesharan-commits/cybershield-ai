// ─── server/index.js ─────────────────────────────────────────────────────────
// CyberShield AI — Express.js Backend
// Serves the REST API on port 5000.
// The Vite dev server (port 5173) proxies /api/* requests here.

import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./database.js";
import cveRoutes from "./routes/cves.js";
import dashboardRoutes from "./routes/dashboard.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────

// Allow requests from the Vite dev server and production build
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:4173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

// Parse JSON request bodies
app.use(express.json());

// HTTP request logger (shows method, path, status, response time)
app.use(morgan("dev"));

// ─── DATABASE ─────────────────────────────────────────────────────────────────
connectDB();

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use("/api/cves",       cveRoutes);
app.use("/api/dashboard",  dashboardRoutes);

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
// Quick endpoint to verify the server is running
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "CyberShield AI API is running",
    timestamp: new Date().toISOString(),
    version: "3.0.0",
  });
});

// ─── 404 HANDLER ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
});

// ─── ERROR HANDLER ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err.message);
  res.status(500).json({ success: false, error: "Internal server error" });
});

// ─── START ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log("");
  console.log("╔══════════════════════════════════════╗");
  console.log("║     CyberShield AI — API Server      ║");
  console.log("╠══════════════════════════════════════╣");
  console.log(`║  Running on  http://localhost:${PORT}    ║`);
  console.log("║                                      ║");
  console.log("║  Endpoints:                          ║");
  console.log("║  GET  /api/health                    ║");
  console.log("║  GET  /api/cves                      ║");
  console.log("║  GET  /api/cves/stats/summary        ║");
  console.log("║  POST /api/cves                      ║");
  console.log("║  GET  /api/dashboard/alerts          ║");
  console.log("║  GET  /api/dashboard/threat-dist..   ║");
  console.log("╚══════════════════════════════════════╝");
  console.log("");
});
