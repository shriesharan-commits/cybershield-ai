import { useState, useEffect } from "react";
import { caesarCipher } from "../utils/crypto";

/** Educational descriptions for each cipher mode */
const CIPHER_INFO = {
  caesar:  "Caesar cipher shifts each letter by a fixed number of positions. Used in ancient Rome. Modern equivalent: ROT-13. Security: None — easily brute-forced with only 25 possible keys.",
  base64:  "Base64 is an ENCODING (not encryption) scheme. It converts binary data to ASCII text using 64 characters. Commonly used for JWTs, email attachments, and embedding data in HTML/JSON.",
  xor:     "XOR cipher with a repeating key. If the key is as long as the message (one-time pad), it's theoretically unbreakable. Short repeating keys are vulnerable to Kasiski examination.",
  rot13:   "ROT-13 is Caesar cipher with shift=13. Applying it twice restores the original text. Used in online forums to hide spoilers. NOT encryption — no security whatsoever.",
  reverse: "Simple string reversal. Trivially detectable and reversible. Provides zero security. Only useful for demonstrating that security ≠ obscurity.",
};

/** Modern algorithms reference — what to use in real production systems */
const MODERN_STANDARDS = [
  { name: "AES-256-GCM",          type: "Symmetric",     use: "Data at rest, file encryption",  safe: "SAFE" },
  { name: "ChaCha20-Poly1305",    type: "Symmetric",     use: "TLS, mobile encryption",          safe: "SAFE" },
  { name: "RSA-4096",             type: "Asymmetric",    use: "Key exchange, signatures",         safe: "SAFE" },
  { name: "Ed25519",              type: "Asymmetric",    use: "Digital signatures",               safe: "SAFE" },
  { name: "Argon2id",             type: "Password Hash", use: "Password storage",                 safe: "SAFE" },
  { name: "DES / 3DES",           type: "Symmetric",     use: "Legacy — DO NOT USE",              safe: "CRITICAL" },
];

/**
 * EncryptionPlayground
 * Interactive demonstration of classical ciphers (Caesar, XOR, ROT-13, Base64, Reverse).
 * Pairs each cipher with educational context and a modern standards reference card.
 */
export default function EncryptionPlayground() {
  const [mode, setMode] = useState("caesar");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [shift, setShift] = useState(13);
  const [direction, setDirection] = useState("encrypt");
  const [xorKey, setXorKey] = useState("KEY");

  /** Processes input through the selected cipher/encoding */
  const process = () => {
    switch (mode) {
      case "caesar":
        setOutput(caesarCipher(input, shift, direction === "decrypt"));
        break;
      case "base64":
        try {
          setOutput(direction === "encrypt" ? btoa(input) : atob(input));
        } catch {
          setOutput("ERROR: Invalid Base64 input");
        }
        break;
      case "xor": {
        const keyBytes = Array.from(xorKey || " ").map((c) => c.charCodeAt(0));
        if (direction === "encrypt") {
          const raw = Array.from(input)
            .map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ keyBytes[i % keyBytes.length]))
            .join("");
          setOutput(btoa(raw));
        } else {
          try {
            setOutput(
              Array.from(atob(input))
                .map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ keyBytes[i % keyBytes.length]))
                .join("")
            );
          } catch {
            setOutput("ERROR: Invalid input for decryption");
          }
        }
        break;
      }
      case "rot13":
        setOutput(caesarCipher(input, 13));
        break;
      case "reverse":
        setOutput(input.split("").reverse().join(""));
        break;
    }
  };

  // Re-process whenever any parameter changes
  useEffect(() => {
    if (input) process();
    else setOutput("");
  }, [input, mode, shift, direction, xorKey]);

  return (
    <div className="cs-grid cs-grid-2">
      {/* ── Controls + Input ── */}
      <div className="cs-card">
        <div className="cs-card-title">Encryption Playground</div>

        {/* Cipher mode selector */}
        <div className="toggle-row">
          {["caesar", "base64", "xor", "rot13", "reverse"].map((m) => (
            <button
              key={m} className="cs-btn cs-btn-sm" onClick={() => setMode(m)}
              style={mode === m ? { background: "rgba(0,255,136,0.15)", borderColor: "#00ff88" } : {}}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Direction toggle */}
        <div className="toggle-row">
          {["encrypt", "decrypt"].map((d) => (
            <button
              key={d} className="cs-btn cs-btn-sm" onClick={() => setDirection(d)}
              style={direction === d
                ? { background: "rgba(0,229,255,0.15)", borderColor: "#00e5ff", color: "#00e5ff" }
                : {}}
            >
              {d.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Caesar shift slider */}
        {mode === "caesar" && (
          <div className="gap-sm">
            <span className="cs-label">Shift Amount: {shift}</span>
            <input
              type="range" min={1} max={25} value={shift}
              onChange={(e) => setShift(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#00ff88" }}
            />
          </div>
        )}

        {/* XOR key input */}
        {mode === "xor" && (
          <div className="gap-sm">
            <span className="cs-label">XOR Key</span>
            <input
              className="cs-input" value={xorKey}
              onChange={(e) => setXorKey(e.target.value)}
              placeholder="Enter XOR key..."
            />
          </div>
        )}

        <div className="gap-sm">
          <span className="cs-label">Input</span>
          <textarea
            className="cs-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Enter text to ${direction}...`}
            rows={4}
          />
        </div>
      </div>

      {/* ── Output + Info ── */}
      <div className="cs-card">
        <div className="cs-card-title">Output</div>
        <div className="hash-out" style={{ minHeight: 100 }}>
          <button className="copy-btn" onClick={() => navigator.clipboard.writeText(output)}>COPY</button>
          {output || <span style={{ color: "rgba(224,255,232,0.2)" }}>Output will appear here...</span>}
        </div>

        <div className="gap-md">
          <div className="cs-card-title" style={{ marginBottom: 10 }}>
            About {mode.toUpperCase()}
          </div>
          <div style={{ fontSize: 13, color: "rgba(224,255,232,0.6)", lineHeight: 1.7 }}>
            {CIPHER_INFO[mode]}
          </div>
        </div>
      </div>

      {/* ── Modern Standards Reference ── */}
      <div className="cs-card" style={{ gridColumn: "1/-1" }}>
        <div className="cs-card-title">Modern Cryptography Standards (What to Use in Production)</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {MODERN_STANDARDS.map((a) => (
            <div
              key={a.name}
              style={{
                padding: 12,
                border: `1px solid rgba(${a.safe === "SAFE" ? "0,255,136" : "255,45,85"},0.2)`,
                borderRadius: 2,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 11, color: a.safe === "SAFE" ? "#00ff88" : "#ff2d55" }}>
                  {a.name}
                </span>
                <span className={`cs-badge badge-${a.safe}`}>{a.safe}</span>
              </div>
              <div style={{ fontSize: 10, color: "rgba(224,255,232,0.4)", textTransform: "uppercase", letterSpacing: 1 }}>
                {a.type}
              </div>
              <div style={{ fontSize: 11, color: "rgba(224,255,232,0.6)", marginTop: 4 }}>
                {a.use}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
