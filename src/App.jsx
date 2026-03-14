import { useState, useEffect } from "react";
import "./styles/global.css";

import MatrixCanvas           from "./components/MatrixCanvas";
import Dashboard              from "./components/Dashboard";
import PhishingAnalyzer       from "./components/PhishingAnalyzer";
import PasswordAnalyzer       from "./components/PasswordAnalyzer";
import HashToolkit            from "./components/HashToolkit";
import JWTAnalyzer            from "./components/JWTAnalyzer";
import EncryptionPlayground   from "./components/EncryptionPlayground";
import ThreatIntel            from "./components/ThreatIntel";

/** Navigation tab definitions */
const TABS = [
  { id: "dashboard", label: "Dashboard",        component: Dashboard },
  { id: "phishing",  label: "Phishing Analyzer", component: PhishingAnalyzer },
  { id: "password",  label: "Password Lab",      component: PasswordAnalyzer },
  { id: "hash",      label: "Hash Toolkit",      component: HashToolkit },
  { id: "jwt",       label: "JWT Scanner",       component: JWTAnalyzer },
  { id: "crypto",    label: "Crypto Playground", component: EncryptionPlayground },
  { id: "cve",       label: "Threat Intel",      component: ThreatIntel },
];

/**
 * App
 * Root component — renders the sticky header, tab navigation, and active module.
 * The matrix canvas runs in a fixed layer behind all content.
 */
export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  // Live clock in header
  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(t);
  }, []);

  const ActiveComponent = TABS.find((t) => t.id === activeTab)?.component ?? Dashboard;

  return (
    <div className="cs-root">
      <MatrixCanvas />

      <div className="cs-app">
        {/* ── Header ── */}
        <header className="cs-header">
          <div className="cs-logo">CYBER<span>SHIELD</span> AI</div>

          <div className="cs-status">
            <div className="cs-pulse" />
            SYSTEM ACTIVE
          </div>

          <div className="cs-status" style={{ marginLeft: 16 }}>
            <div className="cs-pulse" style={{ background: "#00e5ff" }} />
            ALL MODULES ONLINE
          </div>

          <div className="cs-time">
            {time} | THREAT LEVEL:{" "}
            <span style={{ color: "#ff9500" }}>ELEVATED</span>
          </div>
        </header>

        {/* ── Navigation ── */}
        <nav className="cs-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`cs-tab ${activeTab === t.id ? "active" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* ── Active Module ── */}
        <main className="cs-content">
          <ActiveComponent />
        </main>

        {/* ── Footer ── */}
        <footer
          style={{
            borderTop: "1px solid rgba(0,255,136,0.1)",
            padding: "12px 24px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}
        >
          <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 10, color: "rgba(224,255,232,0.3)" }}>
            CYBERSHIELD AI — FINAL YEAR SECURITY PROJECT — ALL ANALYSIS RUNS CLIENT-SIDE (NO DATA TRANSMITTED)
          </span>
          <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 10, color: "rgba(0,255,136,0.4)" }}>
            v2.0.0 <span className="blink">█</span>
          </span>
        </footer>
      </div>
    </div>
  );
}
