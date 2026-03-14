// ─── server/routes/dashboard.js ──────────────────────────────────────────────
// REST API routes for dashboard data (alerts + threat distribution).
//
// Endpoints:
//   GET /api/dashboard/alerts               → Alert feed items
//   GET /api/dashboard/threat-distribution  → Threat type percentages

import { Router } from "express";
import { getDB } from "../database.js";

const router = Router();

// ─── GET /api/dashboard/alerts ────────────────────────────────────────────────
// Returns the security alert feed entries, newest first.
router.get("/alerts", (req, res) => {
  try {
    const db = getDB();
    const alerts = db.prepare("SELECT * FROM alerts ORDER BY id DESC").all();
    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/dashboard/alerts ───────────────────────────────────────────────
// Adds a new alert to the feed.
// Body: { type: "critical"|"warning"|"info", message: string, time_ago: string }
router.post("/alerts", (req, res) => {
  try {
    const db = getDB();
    const { type, message, time_ago } = req.body;

    if (!type || !message) {
      return res.status(400).json({ success: false, error: "type and message are required" });
    }

    const validTypes = ["critical", "warning", "info"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, error: `type must be one of: ${validTypes.join(", ")}` });
    }

    const result = db.prepare(
      "INSERT INTO alerts (type, message, time_ago) VALUES (?, ?, ?)"
    ).run(type, message, time_ago || "Just now");

    const created = db.prepare("SELECT * FROM alerts WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/dashboard/threat-distribution ───────────────────────────────────
// Returns threat type percentages for the dashboard bar chart.
router.get("/threat-distribution", (req, res) => {
  try {
    const db = getDB();
    const threats = db.prepare("SELECT * FROM threat_distribution ORDER BY percentage DESC").all();
    res.json({ success: true, data: threats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
