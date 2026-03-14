import { useState } from "react";
import { jwtDecode } from "../utils/analyzers";
import { SAMPLE_JWT } from "../data/constants";

/**
 * JWTAnalyzer
 * Decodes a JSON Web Token and audits it against OWASP JWT security guidelines.
 * Checks for alg:none attacks, missing claims, expired tokens, and weak algorithms.
 */
export default function JWTAnalyzer() {
  const [token, setToken] = useState("");
  const [result, setResult] = useState(null);

  const handleAnalyze = () => setResult(jwtDecode(token));

  const loadSample = () => {
    setToken(SAMPLE_JWT);
    setResult(jwtDecode(SAMPLE_JWT));
  };

  /** Best-practice checklist evaluated against the decoded token */
  const getBestPractices = (header, payload) => [
    { ok: header.alg !== "none",
      msg: "Algorithm is not 'none'" },
    { ok: ["RS256","RS384","RS512","ES256","ES384","ES512"].includes(header.alg),
      msg: "Uses asymmetric algorithm (RS256/ES256 preferred)" },
    { ok: !!payload.exp,
      msg: "Token has expiry (exp) claim" },
    { ok: !!payload.iss,
      msg: "Token has issuer (iss) claim" },
    { ok: !!payload.aud,
      msg: "Token has audience (aud) claim" },
    { ok: !!payload.jti,
      msg: "Token has unique ID (jti) to prevent replay attacks" },
  ];

  return (
    <div className="cs-grid cs-grid-2">
      {/* ── Input ── */}
      <div className="cs-card" style={{ gridColumn: "1/-1" }}>
        <div className="cs-card-title">JWT Token Analyzer & Security Scanner</div>
        <span className="cs-label">Paste JWT token</span>
        <textarea
          className="cs-input"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.xxx"
          rows={4}
        />
        <div className="gap-sm" style={{ display: "flex", gap: 8 }}>
          <button className="cs-btn" onClick={handleAnalyze}>DECODE & ANALYZE</button>
          <button className="cs-btn cs-btn-sm" onClick={loadSample}>LOAD SAMPLE</button>
        </div>
      </div>

      {/* ── Valid Token Results ── */}
      {result?.valid && (
        <>
          {/* Header + security issues */}
          <div className="cs-card">
            <div className="cs-card-title">Header</div>
            <pre style={{ fontFamily: "'Share Tech Mono'", fontSize: 12, color: "#ff9500", lineHeight: 1.8, overflowX: "auto" }}>
              {JSON.stringify(result.header, null, 2)}
            </pre>

            <div className="gap-md">
              <div className="cs-card-title" style={{ marginBottom: 8 }}>Security Issues</div>
              {result.risks.length > 0
                ? result.risks.map((r, i) => (
                    <div key={i} className="risk-item">
                      <span className={`cs-badge badge-${r.level}`}>{r.level}</span>
                      <span style={{ fontSize: 13 }}>{r.msg}</span>
                    </div>
                  ))
                : <span className="cs-badge badge-SAFE" style={{ display: "inline-block" }}>NO ISSUES DETECTED</span>}
            </div>
          </div>

          {/* Payload claims */}
          <div className="cs-card">
            <div className="cs-card-title">Payload Claims</div>
            {Object.entries(result.payload).map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ color: "#00e5ff", fontFamily: "'Share Tech Mono'", fontSize: 11, width: 80, flexShrink: 0 }}>
                  {k}
                </span>
                <span style={{ fontSize: 12, wordBreak: "break-all" }}>
                  {["iat", "exp", "nbf"].includes(k)
                    ? `${v} → ${new Date(v * 1000).toLocaleString()}`
                    : String(v)}
                </span>
              </div>
            ))}
          </div>

          {/* Best practices checklist */}
          <div className="cs-card" style={{ gridColumn: "1/-1" }}>
            <div className="cs-card-title">JWT Security Best Practices</div>
            {getBestPractices(result.header, result.payload).map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ color: c.ok ? "#00ff88" : "#ff2d55" }}>{c.ok ? "✓" : "✕"}</span>
                <span style={{ fontSize: 13, color: c.ok ? "rgba(224,255,232,0.8)" : "rgba(255,45,85,0.7)" }}>
                  {c.msg}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Invalid Token Error ── */}
      {result && !result.valid && (
        <div className="cs-card" style={{ gridColumn: "1/-1" }}>
          <span className="cs-badge badge-CRITICAL">INVALID TOKEN</span>
          <div style={{ marginTop: 8, fontFamily: "'Share Tech Mono'", fontSize: 12, color: "#ff2d55" }}>
            {result.error}
          </div>
        </div>
      )}
    </div>
  );
}
