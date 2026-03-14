// ─── STATIC DATA & CONSTANTS ─────────────────────────────────────────────────

/** Top 2024 CVEs with CVSS scores, severity, and patch status */
export const CVE_DATA = [
  {
    id: "CVE-2024-3094",
    cvss: 10.0,
    severity: "CRITICAL",
    product: "XZ Utils 5.6.0-5.6.1",
    desc: "Backdoor in liblzma used by OpenSSH via systemd. Malicious code injected by compromised maintainer.",
    vector: "Supply Chain",
    patched: true,
  },
  {
    id: "CVE-2024-21762",
    cvss: 9.8,
    severity: "CRITICAL",
    product: "Fortinet FortiOS",
    desc: "Out-of-bounds write in SSL VPN allows unauthenticated RCE via crafted HTTP requests.",
    vector: "Network",
    patched: true,
  },
  {
    id: "CVE-2024-1709",
    cvss: 10.0,
    severity: "CRITICAL",
    product: "ConnectWise ScreenConnect",
    desc: "Authentication bypass using crafted path traversal to impersonate any user.",
    vector: "Network",
    patched: true,
  },
  {
    id: "CVE-2024-23897",
    cvss: 9.8,
    severity: "CRITICAL",
    product: "Jenkins 2.441",
    desc: "Arbitrary file read via CLI that can lead to RCE. Over 45,000 servers exposed.",
    vector: "Network",
    patched: true,
  },
  {
    id: "CVE-2024-4577",
    cvss: 9.8,
    severity: "CRITICAL",
    product: "PHP 8.3.7 (Windows)",
    desc: "CGI argument injection bypass leads to remote code execution via URL encoding.",
    vector: "Network",
    patched: true,
  },
  {
    id: "CVE-2024-38063",
    cvss: 9.8,
    severity: "CRITICAL",
    product: "Windows TCP/IP Stack",
    desc: "IPv6 wormable remote code execution with zero user interaction required.",
    vector: "Network",
    patched: true,
  },
  {
    id: "CVE-2024-30078",
    cvss: 8.8,
    severity: "HIGH",
    product: "Windows Wi-Fi Driver",
    desc: "Adjacent network attacker can execute arbitrary code without authentication.",
    vector: "Adjacent",
    patched: true,
  },
  {
    id: "CVE-2024-21351",
    cvss: 7.6,
    severity: "HIGH",
    product: "Windows SmartScreen",
    desc: "Security feature bypass allowing malicious files to run without warnings.",
    vector: "Local",
    patched: true,
  },
  {
    id: "CVE-2024-20674",
    cvss: 9.0,
    severity: "CRITICAL",
    product: "Windows Kerberos",
    desc: "Security feature bypass allowing auth impersonation on local networks.",
    vector: "Network",
    patched: true,
  },
];

/** Simulated real-time security alert feed for the dashboard */
export const ALERT_FEED = [
  { type: "critical", msg: "Port scan detected from 192.168.1.45",             time: "00:03s ago" },
  { type: "critical", msg: "Brute-force SSH attempt blocked (142.93.x.x)",      time: "00:18s ago" },
  { type: "warning",  msg: "Unusual outbound traffic on port 4444",             time: "01:02s ago" },
  { type: "warning",  msg: "DNS tunneling pattern detected",                    time: "02:15s ago" },
  { type: "info",     msg: "Firewall rule updated — CVE-2024-3094 patched",     time: "05:30s ago" },
  { type: "info",     msg: "New device joined network: 10.0.0.87",              time: "08:45s ago" },
];

/** Threat distribution data for dashboard chart */
export const THREAT_DISTRIBUTION = [
  { name: "Malware",   val: 34, color: "#ff2d55" },
  { name: "Phishing",  val: 28, color: "#ff9500" },
  { name: "DDoS",      val: 19, color: "#ffd60a" },
  { name: "MITM",      val: 12, color: "#bf5af2" },
  { name: "Other",     val: 7,  color: "#00e5ff" },
];

/** Sample JWT for the JWT Analyzer demo */
export const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" +
  ".eyJzdWIiOiJ1c2VyXzEyMyIsIm5hbWUiOiJKb2huIERvZSIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcxNjIzOTAyMn0" +
  ".SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

/** Sample phishing URLs for the analyzer demo */
export const SAMPLE_URLS = [
  "https://paypa1-secure-login.xyz/account/verify",
  "https://g00gle.tk/signin?redirect=gmail",
  "https://github.com/anthropics/anthropic-sdk",
  "http://banking-secure-update.click/%61%63%63%6F%75%6E%74",
];

/** Most commonly used passwords — checked against user input */
export const COMMON_PASSWORDS = [
  "password", "123456", "qwerty", "letmein", "admin",
  "welcome", "monkey", "dragon", "master", "sunshine",
  "iloveyou", "password1", "abc123", "111111", "12345678",
];
