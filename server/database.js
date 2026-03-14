// ─── server/database.js ───────────────────────────────────────────────────────
// Sets up the SQLite database, creates all tables, and seeds initial data.
// Uses better-sqlite3 (synchronous API — simpler for a project like this).

import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Database file is stored at server/cybershield.db
// It is created automatically if it doesn't exist.
const DB_PATH = path.join(__dirname, "cybershield.db");

let db;

// ─── CONNECT ──────────────────────────────────────────────────────────────────
export function connectDB() {
  db = new Database(DB_PATH);

  // WAL mode = much faster writes, safe for concurrent reads
  db.pragma("journal_mode = WAL");

  console.log(`✅ SQLite connected → ${DB_PATH}`);
  createTables();
  seedData();
  return db;
}

export function getDB() {
  if (!db) throw new Error("Database not connected. Call connectDB() first.");
  return db;
}

// ─── CREATE TABLES ────────────────────────────────────────────────────────────
function createTables() {
  db.exec(`
    -- CVE vulnerability records
    CREATE TABLE IF NOT EXISTS cves (
      id          TEXT    PRIMARY KEY,   -- e.g. CVE-2024-3094
      cvss        REAL    NOT NULL,      -- 0.0 to 10.0
      severity    TEXT    NOT NULL,      -- CRITICAL / HIGH / MEDIUM / LOW
      product     TEXT    NOT NULL,
      description TEXT    NOT NULL,
      vector      TEXT    NOT NULL,      -- Network / Adjacent / Local / Supply Chain
      patched     INTEGER NOT NULL DEFAULT 1,  -- 1 = true, 0 = false
      created_at  TEXT    DEFAULT (datetime('now'))
    );

    -- Alert feed entries for the dashboard
    CREATE TABLE IF NOT EXISTS alerts (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      type        TEXT    NOT NULL,      -- critical / warning / info
      message     TEXT    NOT NULL,
      time_ago    TEXT    NOT NULL,
      created_at  TEXT    DEFAULT (datetime('now'))
    );

    -- Threat distribution percentages for the dashboard chart
    CREATE TABLE IF NOT EXISTS threat_distribution (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      percentage  INTEGER NOT NULL,
      color       TEXT    NOT NULL
    );
  `);

  console.log("✅ Tables created (or already exist)");
}

// ─── SEED DATA ────────────────────────────────────────────────────────────────
// Only inserts data if the tables are empty — safe to call on every startup.
function seedData() {
  seedCVEs();
  seedAlerts();
  seedThreatDistribution();
}

function seedCVEs() {
  const count = db.prepare("SELECT COUNT(*) as n FROM cves").get().n;
  if (count > 0) return; // Already seeded

  const insert = db.prepare(`
    INSERT INTO cves (id, cvss, severity, product, description, vector, patched)
    VALUES (@id, @cvss, @severity, @product, @description, @vector, @patched)
  `);

  const cves = [
    {
      id: "CVE-2024-3094",
      cvss: 10.0,
      severity: "CRITICAL",
      product: "XZ Utils 5.6.0-5.6.1",
      description: "Backdoor in liblzma used by OpenSSH via systemd. Malicious code injected by compromised maintainer.",
      vector: "Supply Chain",
      patched: 1,
    },
    {
      id: "CVE-2024-21762",
      cvss: 9.8,
      severity: "CRITICAL",
      product: "Fortinet FortiOS",
      description: "Out-of-bounds write in SSL VPN allows unauthenticated RCE via crafted HTTP requests.",
      vector: "Network",
      patched: 1,
    },
    {
      id: "CVE-2024-1709",
      cvss: 10.0,
      severity: "CRITICAL",
      product: "ConnectWise ScreenConnect",
      description: "Authentication bypass using crafted path traversal to impersonate any user.",
      vector: "Network",
      patched: 1,
    },
    {
      id: "CVE-2024-23897",
      cvss: 9.8,
      severity: "CRITICAL",
      product: "Jenkins 2.441",
      description: "Arbitrary file read via CLI that can lead to RCE. Over 45,000 servers exposed.",
      vector: "Network",
      patched: 1,
    },
    {
      id: "CVE-2024-4577",
      cvss: 9.8,
      severity: "CRITICAL",
      product: "PHP 8.3.7 (Windows)",
      description: "CGI argument injection bypass leads to remote code execution via URL encoding.",
      vector: "Network",
      patched: 1,
    },
    {
      id: "CVE-2024-38063",
      cvss: 9.8,
      severity: "CRITICAL",
      product: "Windows TCP/IP Stack",
      description: "IPv6 wormable remote code execution with zero user interaction required.",
      vector: "Network",
      patched: 1,
    },
    {
      id: "CVE-2024-30078",
      cvss: 8.8,
      severity: "HIGH",
      product: "Windows Wi-Fi Driver",
      description: "Adjacent network attacker can execute arbitrary code without authentication.",
      vector: "Adjacent",
      patched: 1,
    },
    {
      id: "CVE-2024-21351",
      cvss: 7.6,
      severity: "HIGH",
      product: "Windows SmartScreen",
      description: "Security feature bypass allowing malicious files to run without warnings.",
      vector: "Local",
      patched: 1,
    },
    {
      id: "CVE-2024-20674",
      cvss: 9.0,
      severity: "CRITICAL",
      product: "Windows Kerberos",
      description: "Security feature bypass allowing auth impersonation on local networks.",
      vector: "Network",
      patched: 1,
    },
    {
      id: "CVE-2024-49138",
      cvss: 7.8,
      severity: "HIGH",
      product: "Windows CLFS Driver",
      description: "Heap-based buffer overflow in Common Log File System allows local privilege escalation.",
      vector: "Local",
      patched: 1,
    },
    {
      id: "CVE-2024-29988",
      cvss: 8.8,
      severity: "HIGH",
      product: "Microsoft SmartScreen",
      description: "Protection bypass via crafted file that evades security prompts when opened.",
      vector: "Network",
      patched: 1,
    },
    {
      id: "CVE-2024-21413",
      cvss: 9.8,
      severity: "CRITICAL",
      product: "Microsoft Outlook",
      description: "Preview pane RCE via specially crafted email — no user click required.",
      vector: "Network",
      patched: 1,
    },
    {
      id: "CVE-2024-6387",
      cvss: 8.1,
      severity: "HIGH",
      product: "OpenSSH (regreSSHion)",
      description: "Race condition in signal handler allows unauthenticated RCE as root on glibc Linux.",
      vector: "Network",
      patched: 1,
    },
    {
      id: "CVE-2024-27198",
      cvss: 9.8,
      severity: "CRITICAL",
      product: "JetBrains TeamCity",
      description: "Authentication bypass via alternative path allows attacker to create admin accounts.",
      vector: "Network",
      patched: 1,
    },
    {
      id: "CVE-2024-24919",
      cvss: 8.6,
      severity: "HIGH",
      product: "Check Point Security Gateway",
      description: "Path traversal allows unauthenticated attacker to read sensitive files including /etc/passwd.",
      vector: "Network",
      patched: 1,
    },
  ];

  // Use a transaction for fast bulk insert
  const insertMany = db.transaction((rows) => {
    for (const row of rows) insert.run(row);
  });

  insertMany(cves);
  console.log(`✅ Seeded ${cves.length} CVE records`);
}

function seedAlerts() {
  const count = db.prepare("SELECT COUNT(*) as n FROM alerts").get().n;
  if (count > 0) return;

  const insert = db.prepare(
    "INSERT INTO alerts (type, message, time_ago) VALUES (@type, @message, @time_ago)"
  );

  const alerts = [
    { type: "critical", message: "Port scan detected from 192.168.1.45",           time_ago: "00:03s ago" },
    { type: "critical", message: "Brute-force SSH attempt blocked (142.93.x.x)",    time_ago: "00:18s ago" },
    { type: "warning",  message: "Unusual outbound traffic on port 4444",           time_ago: "01:02s ago" },
    { type: "warning",  message: "DNS tunneling pattern detected",                  time_ago: "02:15s ago" },
    { type: "info",     message: "Firewall rule updated — CVE-2024-3094 patched",   time_ago: "05:30s ago" },
    { type: "info",     message: "New device joined network: 10.0.0.87",            time_ago: "08:45s ago" },
  ];

  const insertMany = db.transaction((rows) => {
    for (const row of rows) insert.run(row);
  });

  insertMany(alerts);
  console.log(`✅ Seeded ${alerts.length} alert records`);
}

function seedThreatDistribution() {
  const count = db.prepare("SELECT COUNT(*) as n FROM threat_distribution").get().n;
  if (count > 0) return;

  const insert = db.prepare(
    "INSERT INTO threat_distribution (name, percentage, color) VALUES (@name, @percentage, @color)"
  );

  const threats = [
    { name: "Malware",  percentage: 34, color: "#ff2d55" },
    { name: "Phishing", percentage: 28, color: "#ff9500" },
    { name: "DDoS",     percentage: 19, color: "#ffd60a" },
    { name: "MITM",     percentage: 12, color: "#bf5af2" },
    { name: "Other",    percentage: 7,  color: "#00e5ff" },
  ];

  const insertMany = db.transaction((rows) => {
    for (const row of rows) insert.run(row);
  });

  insertMany(threats);
  console.log(`✅ Seeded ${threats.length} threat distribution records`);
}
