import { useState, useEffect } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAlerts, useThreatDistribution } from "../hooks/useAPI";

function generateNetworkData() {
  const now = Date.now();
  return Array.from({ length: 30 }, (_, i) => ({
    time: new Date(now - (29 - i) * 2000).toLocaleTimeString(),
    inbound:  Math.floor(Math.random() * 800 + 200),
    outbound: Math.floor(Math.random() * 600 + 100),
  }));
}

export default function Dashboard() {
  const [netData, setNetData] = useState(generateNetworkData());
  const [stats,   setStats]   = useState({ blocked: 1847, scanned: 24691, alerts: 6, uptime: 99.97 });

  // Fetch alerts and threat distribution from SQLite database
  const { data: alerts,       loading: alertsLoading }  = useAlerts();
  const { data: threatData,   loading: threatLoading }   = useThreatDistribution();

  useEffect(() => {
    const t = setInterval(() => {
      setNetData(prev => [...prev.slice(1), {
        time: new Date().toLocaleTimeString(),
        inbound:  Math.floor(Math.random() * 800 + 200),
        outbound: Math.floor(Math.random() * 600 + 100),
      }]);
      setStats(prev => ({
        ...prev,
        blocked: prev.blocked + Math.floor(Math.random() * 3),
        scanned: prev.scanned + Math.floor(Math.random() * 20),
      }));
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const metrics = [
    { label: "Threats Blocked", val: stats.blocked.toLocaleString(), color: "#ff2d55" },
    { label: "Packets Scanned", val: stats.scanned.toLocaleString(), color: "#00ff88" },
    { label: "Active Alerts",   val: alerts ? alerts.length : stats.alerts, color: "#ff9500" },
    { label: "System Uptime",   val: `${stats.uptime}%`,              color: "#00e5ff" },
  ];

  return (
    <div>
      <div className="dash-metrics">
        {metrics.map(m => (
          <div key={m.label} className="stat-block">
            <div className="stat-val" style={{ color: m.color }}>{m.val}</div>
            <div className="stat-label">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="cs-grid cs-grid-2">
        <div className="cs-card">
          <div className="cs-card-title">Live Network Traffic</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={netData}>
              <defs>
                <linearGradient id="gin"  x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00ff88" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gout" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00e5ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" tick={{ fill: "rgba(224,255,232,0.4)", fontSize: 9 }} tickLine={false} interval={5} />
              <YAxis tick={{ fill: "rgba(224,255,232,0.4)", fontSize: 9 }} tickLine={false} />
              <Tooltip contentStyle={{ background: "#041424", border: "1px solid rgba(0,255,136,0.2)", fontSize: 11 }} />
              <Area type="monotone" dataKey="inbound"  stroke="#00ff88" fill="url(#gin)"  strokeWidth={2} />
              <Area type="monotone" dataKey="outbound" stroke="#00e5ff" fill="url(#gout)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="cs-card">
          <div className="cs-card-title">
            Threat Distribution
            {!threatLoading && <span className="cs-badge badge-INFO" style={{ marginLeft: 8 }}>FROM DB</span>}
          </div>
          {threatLoading
            ? <div className="mono-sm scanning" style={{ padding: 20 }}>Loading from database...</div>
            : (
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <ResponsiveContainer width="50%" height={180}>
                  <BarChart data={threatData || []} layout="vertical">
                    <XAxis type="number" tick={{ fill: "rgba(224,255,232,0.4)", fontSize: 9 }} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: "rgba(224,255,232,0.5)", fontSize: 10 }} tickLine={false} width={60} />
                    <Tooltip contentStyle={{ background: "#041424", border: "1px solid rgba(0,255,136,0.2)", fontSize: 11 }} />
                    <Bar dataKey="percentage" radius={[0, 2, 2, 0]} fill="#00ff88" />
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ flex: 1 }}>
                  {(threatData || []).map(d => (
                    <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, flex: 1 }}>{d.name}</span>
                      <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 12, color: d.color }}>{d.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        <div className="cs-card" style={{ gridColumn: "1 / -1" }}>
          <div className="cs-card-title">
            Live Security Alert Feed
            {!alertsLoading && <span className="cs-badge badge-INFO" style={{ marginLeft: 8 }}>FROM DB</span>}
          </div>
          {alertsLoading
            ? <div className="mono-sm scanning" style={{ padding: 20 }}>Loading alerts from database...</div>
            : (alerts || []).map((a, i) => (
              <div key={i} className={`alert-item alert-${a.type}`}>
                <span className={`cs-badge badge-${a.type === "critical" ? "CRITICAL" : a.type === "warning" ? "HIGH" : "INFO"}`}>
                  {a.type.toUpperCase()}
                </span>
                <span style={{ flex: 1, fontSize: 13 }}>{a.message}</span>
                <span className="mono-sm">{a.time_ago}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
