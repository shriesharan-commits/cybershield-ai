import { useState, useEffect, useCallback } from "react";
import { sha256, md5 } from "../utils/crypto";

/**
 * HashToolkit
 * Computes SHA-256, MD5, Base64, Base32 in real-time as the user types.
 * Also renders a hex dump view of the raw bytes.
 */
export default function HashToolkit() {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState({});
  const [copied, setCopied] = useState("");
  const [encoding, setEncoding] = useState("plaintext");

  /** Recomputes all encodings/hashes whenever input or encoding mode changes */
  const compute = useCallback(async () => {
    if (!input) { setHashes({}); return; }

    const text = encoding === "base64" ? atob(input) : input;
    const s256  = await sha256(text);
    const m5    = md5(text);
    const b64   = btoa(input);
    const hex   = Array.from(new TextEncoder().encode(text))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(" ");

    // Base32 encoding (RFC 4648)
    const b32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let b32 = "", bits = 0, val = 0;
    for (const byte of new TextEncoder().encode(text)) {
      val = (val << 8) | byte;
      bits += 8;
      while (bits >= 5) {
        b32 += b32chars[(val >> (bits - 5)) & 31];
        bits -= 5;
      }
    }
    if (bits > 0) b32 += b32chars[(val << (5 - bits)) & 31];

    setHashes({
      sha256: s256,
      md5: m5,
      base64: b64,
      hex: hex.toUpperCase(),
      base32: b32,
      length: input.length,
      bytes: new TextEncoder().encode(text).length,
    });
  }, [input, encoding]);

  useEffect(() => { compute(); }, [compute]);

  const copy = (key, val) => {
    navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const hashDefs = [
    { key: "sha256", label: "SHA-256", bits: "256-bit", safe: true },
    { key: "md5",    label: "MD5",     bits: "128-bit", safe: false },
    { key: "base64", label: "Base64",  bits: "Encoding", safe: null },
    { key: "base32", label: "Base32",  bits: "Encoding", safe: null },
  ];

  return (
    <div className="cs-grid cs-grid-2">
      {/* ── Input Panel ── */}
      <div className="cs-card">
        <div className="cs-card-title">Hash & Encoding Toolkit</div>
        <span className="cs-label">Input text or data</span>
        <textarea
          className="cs-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to hash or encode..."
          rows={4}
        />

        <div className="gap-sm" style={{ display: "flex", gap: 8 }}>
          {["plaintext", "base64"].map((e) => (
            <button
              key={e} className="cs-btn cs-btn-sm" onClick={() => setEncoding(e)}
              style={encoding === e ? { background: "rgba(0,255,136,0.15)" } : {}}
            >
              {e.toUpperCase()} INPUT
            </button>
          ))}
        </div>

        {input && (
          <div className="gap-md">
            <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
              <div style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 2, flex: 1, textAlign: "center" }}>
                <div className="stat-val" style={{ fontSize: 20, color: "#00e5ff" }}>{hashes.length}</div>
                <div className="stat-label">Characters</div>
              </div>
              <div style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 2, flex: 1, textAlign: "center" }}>
                <div className="stat-val" style={{ fontSize: 20, color: "#00ff88" }}>{hashes.bytes}</div>
                <div className="stat-label">Bytes (UTF-8)</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Hash Outputs ── */}
      <div className="cs-card">
        <div className="cs-card-title">Hash Outputs</div>
        {hashDefs.map((h) => (
          <div key={h.key} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 700 }}>{h.label}</span>
              <span className="mono-sm">({h.bits})</span>
              {h.safe === true  && <span className="cs-badge badge-SAFE">SECURE</span>}
              {h.safe === false && <span className="cs-badge badge-HIGH">DEPRECATED</span>}
              {h.safe === null  && <span className="cs-badge badge-INFO">ENCODING</span>}
            </div>
            <div className="hash-out">
              <button className="copy-btn" onClick={() => copy(h.key, hashes[h.key] || "")}>
                {copied === h.key ? "✓ COPIED" : "COPY"}
              </button>
              <span className="mono">
                {hashes[h.key] || (
                  <span style={{ color: "rgba(224,255,232,0.2)" }}>Enter text above...</span>
                )}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Hex Dump ── */}
      {hashes.hex && (
        <div className="cs-card" style={{ gridColumn: "1/-1" }}>
          <div className="cs-card-title">Hex Dump View</div>
          <div style={{ maxHeight: 160, overflowY: "auto" }}>
            <div className="hex-dump">
              {(() => {
                const bytes = hashes.hex.split(" ");
                const rows = [];
                for (let i = 0; i < bytes.length; i += 16) {
                  const rowBytes = bytes.slice(i, i + 16);
                  const ascii = rowBytes
                    .map((b) => {
                      const c = parseInt(b, 16);
                      return c >= 32 && c < 127 ? String.fromCharCode(c) : ".";
                    })
                    .join("");
                  rows.push(
                    <div key={i}>
                      <span className="hex-offset">{i.toString(16).padStart(4, "0")}</span>
                      {rowBytes.join(" ").padEnd(47)}
                      <span className="hex-ascii">{ascii}</span>
                    </div>
                  );
                }
                return rows;
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
