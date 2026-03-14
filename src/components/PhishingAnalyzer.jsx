import { useState } from "react";
import { analyzeURL } from "../utils/analyzers";
import { SAMPLE_URLS } from "../data/constants";

/**
 * PhishingAnalyzer
 * Inspects a URL for phishing indicators using a rule-based heuristic engine.
 * Shows an animated safety score ring, per-indicator risk breakdown,
 * and details on each detection method used.
 */
export default function PhishingAnalyzer() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);

  const handleAnalyze = () => {
    if (!url.trim()) return;
    setScanning(true);
    setResult(null);
    // Simulate async network scan with realistic delay
    setTimeout(() => {
      setResult(analyzeURL(url));
      setScanning(false);
    }, 1200);
  };

  // Score ring SVG calculations
  const scoreColor = result
    ? result.score >= 80 ? "#00ff88"
    : result.score >= 50 ? "#ffd60a"
    : "#ff2d55"
    : "#00ff88";
  const circumference = 2 * Math.PI * 45;
  const dash = result ? ((100 - result.score) / 100) * circumference : 0;

  const detectionMethods = [
    { name: "Keyword Analysis",    desc: "Detects brand impersonation terms (paypal, google, amazon...)" },
    { name: "TLD Inspection",      desc: "Flags known abused free TLDs (.tk, .xyz, .ml, .cf...)" },
    { name: "URL Entropy",         desc: "Measures information entropy to detect random/obfuscated domains" },
    { name: "IDN Homograph",       desc: "Detects Unicode character substitution attacks (Cyrillic, Greek...)" },
    { name: "Encoding Detection",  desc: "Identifies suspicious URL-encoding used to hide destinations" },
    { name: "Structural Analysis", desc: "Checks subdomain depth, path complexity, and query parameters" },
  ];

  return (
    <div className="cs-grid cs-grid-2">
      {/* ── Input Panel ── */}
      <div className="cs-card">
        <div className="cs-card-title">Phishing URL Analyzer</div>
        <span className="cs-label">Enter URL to analyze</span>
        <input
          className="cs-input"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/path?query=value"
          onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
        />

        <div className="gap-sm" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="cs-btn" onClick={handleAnalyze} disabled={scanning}>
            {scanning ? <span className="scanning">SCANNING...</span> : "ANALYZE URL"}
          </button>
          {scanning && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div className="cs-pulse" />
              <span className="mono-sm">Deep inspection in progress</span>
            </div>
          )}
        </div>

        <div className="gap-md">
          <span className="cs-label">Quick test samples:</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {SAMPLE_URLS.map((s, i) => (
              <button
                key={i} onClick={() => setUrl(s)}
                style={{ background: "none", border: "none", textAlign: "left", cursor: "pointer", padding: "4px 0" }}
              >
                <span className="mono-sm" style={{ color: "#00e5ff" }}>
                  ▸ {s.length > 55 ? s.slice(0, 55) + "…" : s}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Results Panel ── */}
      {result && (
        <div className="cs-card">
          <div className="cs-card-title">Analysis Results</div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 16 }}>
            {/* Animated score ring */}
            <div className="score-ring">
              <svg width={110} height={110}>
                <circle cx={55} cy={55} r={45} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={8} />
                <circle
                  cx={55} cy={55} r={45} fill="none"
                  stroke={scoreColor} strokeWidth={8}
                  strokeDasharray={circumference}
                  strokeDashoffset={dash}
                  strokeLinecap="round"
                  transform="rotate(-90 55 55)"
                  style={{
                    transition: "stroke-dashoffset 0.6s, stroke 0.3s",
                    filter: `drop-shadow(0 0 8px ${scoreColor})`,
                  }}
                />
              </svg>
              <div className="score-val" style={{ color: scoreColor }}>
                <div style={{ fontSize: 22, fontWeight: 900 }}>{result.score}</div>
                <div style={{ fontSize: 9, color: "rgba(224,255,232,0.5)", letterSpacing: 1 }}>SAFETY</div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: scoreColor, marginBottom: 4 }}>
                {result.score >= 80 ? "✓ LIKELY SAFE"
                  : result.score >= 50 ? "⚠ SUSPICIOUS"
                  : "✕ HIGH RISK"}
              </div>
              <div style={{ fontSize: 12, color: "rgba(224,255,232,0.5)" }}>
                {result.risks.length} indicator(s) found
              </div>
            </div>
          </div>

          {result.risks.map((r, i) => (
            <div key={i} className="risk-item">
              <span className={`cs-badge badge-${r.level}`}>{r.level}</span>
              <span style={{ fontSize: 13 }}>{r.msg}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Detection Methods Reference ── */}
      <div className="cs-card" style={{ gridColumn: result ? "1/-1" : undefined }}>
        <div className="cs-card-title">Detection Methods Used</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
          {detectionMethods.map((m) => (
            <div key={m.name} style={{ padding: "12px", border: "1px solid rgba(0,255,136,0.1)", borderRadius: 2 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#00ff88", marginBottom: 4 }}>{m.name}</div>
              <div style={{ fontSize: 11, color: "rgba(224,255,232,0.5)" }}>{m.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
