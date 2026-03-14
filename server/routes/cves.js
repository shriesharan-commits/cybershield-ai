// ─── server/routes/cves.js ────────────────────────────────────────────────────
// REST API routes for CVE vulnerability data.
//
// Endpoints:
//   GET  /api/cves              → All CVEs (with optional search & severity filter)
//   GET  /api/cves/:id          → Single CVE by ID
//   POST /api/cves              → Add a new CVE
//   PUT  /api/cves/:id          → Update an existing CVE
//   DELETE /api/cves/:id        → Delete a CVE
//   GET  /api/cves/stats/summary → Aggregate stats (counts, avg CVSS)

import { Router } from "express";
import { getDB } from "../database.js";

const router = Router();

// ─── GET /api/cves ────────────────────────────────────────────────────────────
// Returns all CVEs. Supports query params:
//   ?search=jenkins        → full-text search across id, product, description
//   ?severity=CRITICAL     → filter by severity level
//   ?vector=Network        → filter by attack vector
//   ?patched=true/false    → filter by patch status
router.get("/", (req, res) => {
  try {
    const db = getDB();
    const { search, severity, vector, patched } = req.query;

    let query = "SELECT * FROM cves WHERE 1=1";
    const params = [];

    if (search) {
      query += " AND (id LIKE ? OR product LIKE ? OR description LIKE ?)";
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (severity && severity !== "ALL") {
      query += " AND severity = ?";
      params.push(severity.toUpperCase());
    }

    if (vector) {
      query += " AND vector = ?";
      params.push(vector);
    }

    if (patched !== undefined) {
      query += " AND patched = ?";
      params.push(patched === "true" ? 1 : 0);
    }

    query += " ORDER BY cvss DESC";

    const cves = db.prepare(query).all(...params);

    // Convert SQLite integer (0/1) back to boolean for the frontend
    const formatted = cves.map((c) => ({ ...c, patched: c.patched === 1 }));

    res.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/cves/stats/summary ─────────────────────────────────────────────
// Returns aggregate statistics for the dashboard metric cards.
// NOTE: This route must be defined BEFORE /:id to avoid "stats" being treated as an ID.
router.get("/stats/summary", (req, res) => {
  try {
    const db = getDB();

    const total      = db.prepare("SELECT COUNT(*) as n FROM cves").get().n;
    const critical   = db.prepare("SELECT COUNT(*) as n FROM cves WHERE severity = 'CRITICAL'").get().n;
    const high       = db.prepare("SELECT COUNT(*) as n FROM cves WHERE severity = 'HIGH'").get().n;
    const medium     = db.prepare("SELECT COUNT(*) as n FROM cves WHERE severity = 'MEDIUM'").get().n;
    const patched    = db.prepare("SELECT COUNT(*) as n FROM cves WHERE patched = 1").get().n;
    const avgCvss    = db.prepare("SELECT ROUND(AVG(cvss), 1) as avg FROM cves").get().avg;
    const maxCvss    = db.prepare("SELECT MAX(cvss) as max FROM cves").get().max;

    res.json({
      success: true,
      data: {
        total,
        critical,
        high,
        medium,
        patched,
        unpatched: total - patched,
        avgCvss,
        maxCvss,
        allPatched: patched === total,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/cves/:id ────────────────────────────────────────────────────────
// Returns a single CVE by its ID (e.g. CVE-2024-3094)
router.get("/:id", (req, res) => {
  try {
    const db = getDB();
    const cve = db.prepare("SELECT * FROM cves WHERE id = ?").get(req.params.id);

    if (!cve) {
      return res.status(404).json({ success: false, error: `CVE ${req.params.id} not found` });
    }

    res.json({ success: true, data: { ...cve, patched: cve.patched === 1 } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/cves ───────────────────────────────────────────────────────────
// Adds a new CVE record.
// Body: { id, cvss, severity, product, description, vector, patched }
router.post("/", (req, res) => {
  try {
    const db = getDB();
    const { id, cvss, severity, product, description, vector, patched } = req.body;

    // Basic validation
    if (!id || !cvss || !severity || !product || !description || !vector) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: id, cvss, severity, product, description, vector",
      });
    }

    if (cvss < 0 || cvss > 10) {
      return res.status(400).json({ success: false, error: "CVSS score must be between 0 and 10" });
    }

    const validSeverities = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "NONE"];
    if (!validSeverities.includes(severity.toUpperCase())) {
      return res.status(400).json({ success: false, error: `Severity must be one of: ${validSeverities.join(", ")}` });
    }

    db.prepare(`
      INSERT INTO cves (id, cvss, severity, product, description, vector, patched)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, cvss, severity.toUpperCase(), product, description, vector, patched ? 1 : 0);

    const created = db.prepare("SELECT * FROM cves WHERE id = ?").get(id);
    res.status(201).json({ success: true, data: { ...created, patched: created.patched === 1 } });
  } catch (err) {
    if (err.message.includes("UNIQUE constraint")) {
      return res.status(409).json({ success: false, error: `CVE ${req.body.id} already exists` });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── PUT /api/cves/:id ────────────────────────────────────────────────────────
// Updates an existing CVE record.
router.put("/:id", (req, res) => {
  try {
    const db = getDB();
    const existing = db.prepare("SELECT * FROM cves WHERE id = ?").get(req.params.id);

    if (!existing) {
      return res.status(404).json({ success: false, error: `CVE ${req.params.id} not found` });
    }

    const { cvss, severity, product, description, vector, patched } = req.body;

    db.prepare(`
      UPDATE cves
      SET cvss        = COALESCE(?, cvss),
          severity    = COALESCE(?, severity),
          product     = COALESCE(?, product),
          description = COALESCE(?, description),
          vector      = COALESCE(?, vector),
          patched     = COALESCE(?, patched)
      WHERE id = ?
    `).run(
      cvss ?? null,
      severity?.toUpperCase() ?? null,
      product ?? null,
      description ?? null,
      vector ?? null,
      patched !== undefined ? (patched ? 1 : 0) : null,
      req.params.id
    );

    const updated = db.prepare("SELECT * FROM cves WHERE id = ?").get(req.params.id);
    res.json({ success: true, data: { ...updated, patched: updated.patched === 1 } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── DELETE /api/cves/:id ─────────────────────────────────────────────────────
// Deletes a CVE record by ID.
router.delete("/:id", (req, res) => {
  try {
    const db = getDB();
    const existing = db.prepare("SELECT * FROM cves WHERE id = ?").get(req.params.id);

    if (!existing) {
      return res.status(404).json({ success: false, error: `CVE ${req.params.id} not found` });
    }

    db.prepare("DELETE FROM cves WHERE id = ?").run(req.params.id);
    res.json({ success: true, message: `CVE ${req.params.id} deleted successfully` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
