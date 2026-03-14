import { useState } from "react";
import { useCVEs, useCVEStats, addCVE, deleteCVE } from "../hooks/useAPI";

export default function ThreatIntel() {
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [formMsg,  setFormMsg]  = useState("");
  const [newCVE,   setNewCVE]   = useState({
    id: "", cvss: "", severity: "CRITICAL", product: "", description: "", vector: "Network", patched: true,
  });

  const { data: cves,  loading: cvesLoading,  error: cvesError,  refetch: refetchCVEs  } =
    useCVEs({ search, severity: filter });
  const { data: stats, loading: statsLoading } = useCVEStats();

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormMsg("");
    try {
      await addCVE({ ...newCVE, cvss: parseFloat(newCVE.cvss) });
      setFormMsg("✓ CVE added successfully!");
      setNewCVE({ id: "", cvss: "", severity: "CRITICAL", product: "", description: "", vector: "Network", patched: true });
      refetchCVEs();
      setTimeout(() => { setFormMsg(""); setShowForm(false); }, 2000);
    } catch (err) {
      setFormMsg(`✕ Error: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(`Delete ${id}? This cannot be undone.`)) return;
    try { await deleteCVE(id); refetchCVEs(); }
    catch (err) { alert(`Error: ${err.message}`); }
  };

  const tableHeaders = ["CVE ID", "CVSS", "Severity", "Product", "Attack Vector", "Status", "Description", "Actions"];

  return (
    <div>
      <div className="dash-metrics" style={{ marginBottom: 20 }}>
        {statsLoading
          ? Array(4).fill(0).map((_, i) => (
              <div key={i} className="stat-block">
                <div className="stat-val" style={{ color: "rgba(224,255,232,0.2)" }}>—</div>
                <div className="stat-label">Loading...</div>
              </div>
            ))
          : [
              { label: "Critical CVEs",  val: stats?.critical ?? "—", color: "#ff2d55" },
              { label: "High CVEs",      val: stats?.high ?? "—",     color: "#ff9500" },
              { label: "Avg CVSS Score", val: stats?.avgCvss ?? "—",  color: "#ffd60a" },
              { label: "All Patched",    val: stats?.allPatched ? "YES" : "NO", color: stats?.allPatched ? "#00ff88" : "#ff2d55" },
            ].map((m) => (
              <div key={m.label} className="stat-block">
                <div className="stat-val" style={{ color: m.color }}>{m.val}</div>
                <div className="stat-label">{m.label}</div>
              </div>
            ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span className="cs-badge badge-INFO">SQLite DATABASE</span>
        <span className="mono-sm">{cves ? `${cves.length} records loaded` : "Fetching from database..."}</span>
        <span style={{ marginLeft: "auto" }}>
          <button className="cs-btn cs-btn-sm" onClick={() => setShowForm(!showForm)}
            style={showForm ? { background: "rgba(255,45,85,0.15)", borderColor: "#ff2d55", color: "#ff2d55" } : {}}>
            {showForm ? "✕ CANCEL" : "+ ADD CVE"}
          </button>
        </span>
      </div>

      {showForm && (
        <div className="cs-card" style={{ marginBottom: 20 }}>
          <div className="cs-card-title">Add New CVE to Database</div>
          <form onSubmit={handleAdd}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginBottom: 12 }}>
              {[
                { key: "id",          label: "CVE ID",      placeholder: "CVE-2024-XXXXX" },
                { key: "cvss",        label: "CVSS Score",  placeholder: "0.0 – 10.0" },
                { key: "product",     label: "Product",     placeholder: "Affected software" },
                { key: "description", label: "Description", placeholder: "Vulnerability description" },
              ].map(f => (
                <div key={f.key}>
                  <span className="cs-label">{f.label}</span>
                  <input className="cs-input" required value={newCVE[f.key]}
                    onChange={e => setNewCVE(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder} />
                </div>
              ))}
              <div>
                <span className="cs-label">Severity</span>
                <select className="cs-input" value={newCVE.severity}
                  onChange={e => setNewCVE(p => ({ ...p, severity: e.target.value }))}>
                  {["CRITICAL","HIGH","MEDIUM","LOW"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <span className="cs-label">Attack Vector</span>
                <select className="cs-input" value={newCVE.vector}
                  onChange={e => setNewCVE(p => ({ ...p, vector: e.target.value }))}>
                  {["Network","Adjacent","Local","Physical","Supply Chain"].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button type="submit" className="cs-btn">INSERT INTO DATABASE</button>
              {formMsg && <span style={{ fontSize: 13, color: formMsg.startsWith("✓") ? "#00ff88" : "#ff2d55" }}>{formMsg}</span>}
            </div>
          </form>
        </div>
      )}

      <div className="cs-card">
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <input className="cs-input" style={{ flex: 1, minWidth: 200 }} value={search}
            onChange={e => setSearch(e.target.value)} placeholder="Search CVE ID, product, or description..." />
          <div style={{ display: "flex", gap: 4 }}>
            {["ALL","CRITICAL","HIGH","MEDIUM"].map(f => (
              <button key={f} className="cs-btn cs-btn-sm" onClick={() => setFilter(f)}
                style={filter === f ? { background: "rgba(0,255,136,0.15)" } : {}}>{f}</button>
            ))}
          </div>
        </div>

        {cvesLoading && (
          <div style={{ textAlign: "center", padding: 40, color: "rgba(224,255,232,0.4)" }}>
            <div className="cs-pulse" style={{ margin: "0 auto 12px", width: 10, height: 10 }} />
            <div className="mono-sm scanning">Querying SQLite database...</div>
          </div>
        )}

        {cvesError && (
          <div style={{ padding: 20, color: "#ff2d55", fontFamily: "'Share Tech Mono'", fontSize: 12 }}>
            ✕ Database error: {cvesError}
            <div style={{ marginTop: 8, color: "rgba(224,255,232,0.4)", fontSize: 11 }}>
              Make sure the backend is running: <code>npm run server</code>
            </div>
          </div>
        )}

        {!cvesLoading && !cvesError && cves && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(0,255,136,0.2)" }}>
                  {tableHeaders.map(h => (
                    <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontFamily: "'Share Tech Mono'", fontSize: 10, color: "rgba(224,255,232,0.4)", letterSpacing: 1, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cves.length === 0
                  ? <tr><td colSpan={8} style={{ padding: 24, textAlign: "center", color: "rgba(224,255,232,0.3)", fontFamily: "'Share Tech Mono'", fontSize: 12 }}>No CVEs found matching your query</td></tr>
                  : cves.map((c, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(0,255,136,0.04)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "10px 12px", fontFamily: "'Share Tech Mono'", color: "#00e5ff", fontSize: 11 }}>{c.id}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ color: c.cvss >= 9 ? "#ff2d55" : c.cvss >= 7 ? "#ff9500" : "#ffd60a", fontFamily: "'Orbitron'", fontWeight: 700, fontSize: 13 }}>{c.cvss}</span>
                      </td>
                      <td style={{ padding: "10px 12px" }}><span className={`cs-badge badge-${c.severity}`}>{c.severity}</span></td>
                      <td style={{ padding: "10px 12px", fontSize: 12 }}>{c.product}</td>
                      <td style={{ padding: "10px 12px" }}><span className="cs-badge badge-INFO">{c.vector}</span></td>
                      <td style={{ padding: "10px 12px" }}><span className={`cs-badge badge-${c.patched ? "SAFE" : "CRITICAL"}`}>{c.patched ? "PATCHED" : "UNPATCHED"}</span></td>
                      <td style={{ padding: "10px 12px", color: "rgba(224,255,232,0.6)", maxWidth: 300, fontSize: 11 }}>{c.description}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <button onClick={() => handleDelete(c.id)} className="cs-btn cs-btn-sm cs-btn-red" style={{ padding: "4px 10px", fontSize: 10 }}>DELETE</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <div style={{ marginTop: 12, fontFamily: "'Share Tech Mono'", fontSize: 10, color: "rgba(224,255,232,0.3)", textAlign: "right" }}>
              {cves.length} record{cves.length !== 1 ? "s" : ""} returned from SQLite • cybershield.db
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
