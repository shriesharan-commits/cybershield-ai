import { useState } from "react";
import { passwordEntropy } from "../utils/crypto";
import { COMMON_PASSWORDS } from "../data/constants";

/**
 * PasswordAnalyzer
 * Evaluates password strength via Shannon entropy, GPU crack-time estimation,
 * and policy checklist. Also provides a CSPRNG-based password generator.
 */
export default function PasswordAnalyzer() {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [generated, setGenerated] = useState("");

  const entropy = passwordEntropy(pw);

  const strength =
    pw.length === 0 ? null
    : entropy < 28  ? { label: "VERY WEAK",   color: "#ff2d55", pct: 10 }
    : entropy < 36  ? { label: "WEAK",         color: "#ff6b35", pct: 25 }
    : entropy < 60  ? { label: "FAIR",         color: "#ffd60a", pct: 50 }
    : entropy < 80  ? { label: "STRONG",       color: "#00e5ff", pct: 75 }
    :                 { label: "VERY STRONG",  color: "#00ff88", pct: 100 };

  const checks = [
    { ok: pw.length >= 12,                             msg: "At least 12 characters" },
    { ok: /[A-Z]/.test(pw),                            msg: "Uppercase letters (A-Z)" },
    { ok: /[a-z]/.test(pw),                            msg: "Lowercase letters (a-z)" },
    { ok: /[0-9]/.test(pw),                            msg: "Digits (0-9)" },
    { ok: /[^a-zA-Z0-9]/.test(pw),                    msg: "Special characters (!@#$...)" },
    { ok: !/(.)\1{2,}/.test(pw),                       msg: "No repeated characters (aaa)" },
    { ok: !COMMON_PASSWORDS.includes(pw.toLowerCase()), msg: "Not in common password list" },
    { ok: pw.length >= 16,                             msg: "Length ≥ 16 (optimal)" },
  ];

  /**
   * Estimates GPU crack time assuming 1 trillion guesses/second (high-end GPGPU cluster).
   * Based on full keyspace: 2^entropy combinations, average 50% traversal.
   */
  const timeToCrack = () => {
    if (!pw) return "";
    const combinations = Math.pow(2, entropy);
    const secs = combinations / (2 * 1e12); // 1T guesses/sec
    if (secs < 1)          return "Instantly";
    if (secs < 60)         return `~${Math.round(secs)} seconds`;
    if (secs < 3600)       return `~${Math.round(secs / 60)} minutes`;
    if (secs < 86400)      return `~${Math.round(secs / 3600)} hours`;
    if (secs < 31536000)   return `~${Math.round(secs / 86400)} days`;
    if (secs < 3.15e9)     return `~${Math.round(secs / 31536000)} years`;
    if (secs < 3.15e15)    return `~${(secs / 3.15e9).toExponential(1)} million years`;
    return "Heat death of the universe+";
  };

  /**
   * Generates a 20-character cryptographically secure random password
   * using Web Crypto API (crypto.getRandomValues).
   */
  const generatePassword = () => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ" +
      "0123456789!@#$%^&*()-_=+[]{}|;:,.<>?";
    const arr = new Uint8Array(20);
    crypto.getRandomValues(arr);
    setGenerated(
      Array.from(arr)
        .map((b) => chars[b % chars.length])
        .join("")
    );
  };

  const attackMethods = [
    { name: "Dictionary Attack",   risk: "HIGH",     desc: "Tries wordlists of millions of common passwords" },
    { name: "Brute Force",         risk: "MEDIUM",   desc: "Tries all character combinations systematically" },
    { name: "Rainbow Table",       risk: "HIGH",     desc: "Pre-computed hash lookups (defeated by salting)" },
    { name: "Credential Stuffing", risk: "CRITICAL", desc: "Uses leaked username:password pairs from breaches" },
    { name: "Keyboard Walk",       risk: "MEDIUM",   desc: "qwerty, asdfgh, 1q2w3e patterns are pre-indexed" },
  ];

  return (
    <div className="cs-grid cs-grid-2">
      {/* ── Strength Analyzer ── */}
      <div className="cs-card">
        <div className="cs-card-title">Password Strength Analyzer</div>
        <span className="cs-label">Enter password to analyze</span>

        <div style={{ position: "relative" }}>
          <input
            className="cs-input"
            type={show ? "text" : "password"}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Enter any password..."
            style={{ paddingRight: 80 }}
          />
          <button
            onClick={() => setShow(!show)}
            style={{
              position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", color: "rgba(224,255,232,0.5)",
              cursor: "pointer", fontSize: 11, fontFamily: "'Rajdhani'",
            }}
          >
            {show ? "HIDE" : "SHOW"}
          </button>
        </div>

        {strength && (
          <>
            <div className="pw-bar-wrap gap-sm">
              <div className="pw-bar" style={{ width: `${strength.pct}%`, background: strength.color }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ color: strength.color, fontWeight: 700, fontFamily: "'Orbitron'", fontSize: 13 }}>
                {strength.label}
              </span>
              <span className="mono-sm">{entropy.toFixed(1)} bits entropy</span>
            </div>
            <div style={{
              padding: "10px 14px", background: "rgba(0,0,0,0.3)", borderRadius: 2,
              border: "1px solid rgba(255,255,255,0.05)", marginBottom: 12,
            }}>
              <div className="cs-label" style={{ marginBottom: 4 }}>GPU Crack Time (1T guesses/sec)</div>
              <div style={{ fontFamily: "'Orbitron'", fontSize: 16, color: strength.color }}>
                {timeToCrack()}
              </div>
            </div>
          </>
        )}

        {checks.map((c, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
          >
            <span style={{
              color: pw.length === 0 ? "rgba(255,255,255,0.2)" : c.ok ? "#00ff88" : "#ff2d55",
              fontSize: 14,
            }}>
              {pw.length === 0 ? "○" : c.ok ? "✓" : "✕"}
            </span>
            <span style={{
              fontSize: 13,
              color: pw.length === 0 ? "rgba(224,255,232,0.3)" : c.ok ? "rgba(224,255,232,0.8)" : "rgba(255,45,85,0.7)",
            }}>
              {c.msg}
            </span>
          </div>
        ))}
      </div>

      {/* ── Generator + Attack Reference ── */}
      <div className="cs-card">
        <div className="cs-card-title">Cryptographically Secure Generator</div>
        <button className="cs-btn" onClick={generatePassword} style={{ width: "100%", marginBottom: 12 }}>
          GENERATE SECURE PASSWORD
        </button>

        {generated && (
          <div className="hash-out">
            <button className="copy-btn" onClick={() => navigator.clipboard.writeText(generated)}>COPY</button>
            {generated}
            <div style={{ marginTop: 8, fontSize: 10, color: "rgba(224,255,232,0.4)" }}>
              Entropy: {passwordEntropy(generated).toFixed(1)} bits • Generated using crypto.getRandomValues()
            </div>
          </div>
        )}

        <div className="gap-md">
          <div className="cs-card-title" style={{ marginBottom: 12 }}>Common Attack Methods</div>
          {attackMethods.map((a) => (
            <div key={a.name} className="risk-item">
              <span className={`cs-badge badge-${a.risk}`}>{a.risk}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{a.name}</div>
                <div style={{ fontSize: 11, color: "rgba(224,255,232,0.5)" }}>{a.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
