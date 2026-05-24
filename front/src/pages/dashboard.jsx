import { useMemo, useState, useEffect } from "react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

// =============================================================================
// CONSTANTS & HELPERS  (unchanged)
// =============================================================================

const ACTIVITIES = [
  { id: 1, icon: "✅", text: "Marché M-2025-003 visé par le contrôle", time: "Il y a 2h" },
  { id: 2, icon: "📄", text: "Nouvelle loi de finance 2025 ajoutée", time: "Il y a 5h" },
  { id: 3, icon: "👤", text: "Utilisateur Ahmed Benali activé", time: "Hier 14:30" },
  { id: 4, icon: "📅", text: "Réunion de suivi RN6 planifiée", time: "Hier 09:00" },
  { id: 5, icon: "🏗️", text: "Marché M-2025-001 — avancement 45%", time: "Il y a 2j" },
];

const STATUS_CONFIG = {
  "En cours":    { bg: "rgba(0,255,163,0.1)",  color: "#00ffa3", dot: "#00ffa3" },
  "Attribution": { bg: "rgba(255,190,0,0.1)",  color: "#ffbe00", dot: "#ffbe00" },
  "Visé":        { bg: "rgba(0,224,255,0.1)",  color: "#00e0ff", dot: "#00e0ff" },
  "Clôturé":     { bg: "rgba(148,163,184,0.1)",color: "#94a3b8", dot: "#64748b" },
};

const fmtMoney = (n) => `${Number(n || 0).toLocaleString("fr-MA")} MAD`;

// =============================================================================
// MOCK CHART DATA (replace with API later)
// =============================================================================

const BUDGET_TREND = [
  { mois: "Jan", engage: 12000000, paye: 8000000 },
  { mois: "Fév", engage: 19000000, paye: 11000000 },
  { mois: "Mar", engage: 15000000, paye: 13000000 },
  { mois: "Avr", engage: 28000000, paye: 18000000 },
  { mois: "Mai", engage: 22000000, paye: 20000000 },
  { mois: "Jun", engage: 34000000, paye: 24000000 },
  { mois: "Jul", engage: 29000000, paye: 26000000 },
  { mois: "Aoû", engage: 38000000, paye: 30000000 },
  { mois: "Sep", engage: 42000000, paye: 33000000 },
  { mois: "Oct", engage: 36000000, paye: 35000000 },
  { mois: "Nov", engage: 45000000, paye: 38000000 },
  { mois: "Déc", engage: 52000000, paye: 44000000 },
];

const MARCHE_BAR = [
  { type: "Travaux",     count: 14 },
  { type: "Fournitures", count: 9  },
  { type: "Services",    count: 11 },
  { type: "Études",      count: 6  },
];

const SPARKLINE_DATA = [
  [3,7,5,9,6,11,8,14,10,16],
  [5,4,8,6,9,7,12,10,15,13],
  [2,5,3,7,5,9,6,11,8,14],
  [8,6,9,7,11,9,13,10,15,12],
];

// =============================================================================
// GLOBAL CSS
// =============================================================================

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ng:  #00ffa3;
    --nc:  #00e0ff;
    --ngold: #ffbe00;
    --bg:  #020811;
    --panel: rgba(6,18,40,0.85);
    --border: rgba(0,255,163,0.12);
    --bdim:  rgba(255,255,255,0.06);
    --tb: #e8f4f8;
    --tm: #7ba3b8;
    --td: #3a5a6a;
    --fd: 'Orbitron', monospace;
    --fb: 'DM Sans', sans-serif;
    --fm: 'DM Mono', monospace;
  }

  body { background: var(--bg); color: var(--tb); font-family: var(--fb); -webkit-font-smoothing: antialiased; }

  .dash-root {
    min-height: 100vh;
    background:
      radial-gradient(ellipse 70% 45% at 15% 0%,   rgba(0,255,163,0.06) 0%, transparent 70%),
      radial-gradient(ellipse 50% 40% at 90% 80%,   rgba(0,224,255,0.05) 0%, transparent 65%),
      #020811;
    padding: 24px 20px 56px;
  }
.dash-inner { width: 100%; margin: 0; max-width: none; }

  /* Header */
  .dash-header { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:14px; margin-bottom:24px; }
  .dash-logo { font-family:var(--fd); font-size:0.52rem; letter-spacing:0.25em; text-transform:uppercase; color:var(--ng); opacity:0.6; margin-bottom:4px; }
  .dash-title { font-family:var(--fd); font-size:clamp(1rem,2.5vw,1.4rem); font-weight:700; color:var(--tb); letter-spacing:0.05em; }
  .dash-title span { color:var(--ng); }
  .dash-pills { display:flex; gap:8px; flex-wrap:wrap; }
  .dash-pill { display:inline-flex; align-items:center; gap:6px; padding:5px 12px; border-radius:100px; font-size:0.62rem; font-weight:700; letter-spacing:0.06em; border:1px solid; }
  .pill-live { background:rgba(0,255,163,0.08); border-color:rgba(0,255,163,0.3); color:var(--ng); }
  .pill-live-dot { width:6px; height:6px; border-radius:50%; background:var(--ng); box-shadow:0 0 8px var(--ng); animation:blink 1.8s infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.25} }
  .pill-date { background:rgba(0,224,255,0.06); border-color:rgba(0,224,255,0.2); color:var(--nc); }

  .glow-divider { height:1px; background:linear-gradient(90deg,transparent,rgba(0,255,163,0.3),transparent); margin:0 0 20px; }

  /* KPI */
  .kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:18px; }
  @media(max-width:1080px){ .kpi-grid{ grid-template-columns:repeat(2,1fr); } }
  @media(max-width:560px){  .kpi-grid{ grid-template-columns:1fr; } }

  .kpi-card {
    position:relative; overflow:hidden;
    background:var(--panel); border:1px solid var(--border); border-radius:14px;
    padding:18px 16px 14px; backdrop-filter:blur(14px); cursor:default;
    transition:transform 0.25s, border-color 0.25s, box-shadow 0.25s;
  }
  .kpi-card:hover { transform:translateY(-5px); border-color:rgba(0,255,163,0.3); box-shadow:0 0 28px rgba(0,255,163,0.07),0 20px 40px rgba(0,0,0,0.5); }
  .kpi-card::after { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,var(--ng),transparent); opacity:0; transition:opacity 0.3s; }
  .kpi-card:hover::after { opacity:0.5; }
  .kpi-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; }
  .kpi-icon { width:36px; height:36px; border-radius:10px; background:rgba(0,255,163,0.07); border:1px solid rgba(0,255,163,0.18); display:flex; align-items:center; justify-content:center; font-size:0.95rem; }
  .kpi-trend { font-size:0.62rem; font-weight:700; color:var(--ng); background:rgba(0,255,163,0.08); border:1px solid rgba(0,255,163,0.15); padding:3px 7px; border-radius:6px; }
  .kpi-trend.down { color:#ff4d6d; background:rgba(255,77,109,0.08); border-color:rgba(255,77,109,0.15); }
  .kpi-label { font-size:0.65rem; font-weight:600; text-transform:uppercase; letter-spacing:0.1em; color:var(--td); margin-bottom:3px; }
  .kpi-value { font-family:var(--fd); font-size:clamp(0.9rem,2vw,1.2rem); font-weight:700; color:var(--tb); letter-spacing:-0.01em; line-height:1.2; }
  .kpi-delta { font-size:0.65rem; color:var(--tm); margin-top:4px; }
  .kpi-spark { margin-top:8px; height:32px; }

  /* Main chart */
  .main-chart { background:var(--panel); border:1px solid var(--bdim); border-radius:14px; backdrop-filter:blur(14px); overflow:hidden; margin-bottom:16px; transition:border-color 0.25s; }
  .main-chart:hover { border-color:rgba(0,255,163,0.14); }
  .chart-hd { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; padding:16px 22px 12px; border-bottom:1px solid rgba(255,255,255,0.05); }
  .chart-legend { display:flex; gap:14px; }
  .legend-item { display:flex; align-items:center; gap:6px; font-size:0.65rem; color:var(--tm); }
  .legend-dot { width:8px; height:8px; border-radius:50%; }

  /* Analytics grid */
  .analytics-grid { display:grid; grid-template-columns:1fr 1fr 320px; gap:14px; margin-bottom:14px; }
  @media(max-width:1100px){ .analytics-grid{ grid-template-columns:1fr 1fr; } }
  @media(max-width:720px){  .analytics-grid{ grid-template-columns:1fr; } }

  /* Bottom grid */
  .bottom-grid { display:grid; grid-template-columns:2fr 1fr; gap:14px; }
  @media(max-width:900px){ .bottom-grid{ grid-template-columns:1fr; } }

  /* Panel */
  .panel { background:var(--panel); border:1px solid var(--bdim); border-radius:14px; backdrop-filter:blur(14px); overflow:hidden; transition:border-color 0.25s; }
  .panel:hover { border-color:rgba(0,255,163,0.14); }
  .panel-hd { display:flex; align-items:center; justify-content:space-between; padding:14px 20px 10px; border-bottom:1px solid rgba(255,255,255,0.05); }
  .panel-title { font-family:var(--fd); font-size:0.58rem; font-weight:600; text-transform:uppercase; letter-spacing:0.12em; color:var(--ng); }
  .panel-action { font-size:0.62rem; color:var(--td); font-weight:600; background:none; border:none; cursor:pointer; letter-spacing:0.04em; transition:color 0.15s; }
  .panel-action:hover { color:var(--nc); }

  /* Tooltip */
  .ct-tip { background:rgba(2,12,28,0.96); border:1px solid rgba(0,255,163,0.25); border-radius:10px; padding:10px 14px; font-size:0.7rem; font-family:var(--fb); box-shadow:0 0 20px rgba(0,255,163,0.1); }
  .ct-tip-label { color:var(--ng); font-weight:700; margin-bottom:4px; font-size:0.65rem; letter-spacing:0.08em; }
  .ct-tip-row { display:flex; gap:8px; align-items:center; color:var(--tm); margin-top:3px; }
  .ct-tip-val { color:var(--tb); font-weight:600; font-family:var(--fm); }

  /* Progress circle */
  .progress-section { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px 16px; gap:20px; }
  .circle-wrap { position:relative; width:130px; height:130px; }
  .circle-svg { transform:rotate(-90deg); }
  .circle-bg { fill:none; stroke:rgba(0,255,163,0.08); stroke-width:8; }
  .circle-fg { fill:none; stroke:var(--ng); stroke-width:8; stroke-linecap:round; filter:drop-shadow(0 0 6px var(--ng)); transition:stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1); }
  .circle-center { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
  .circle-pct { font-family:var(--fd); font-size:1.5rem; font-weight:700; color:var(--ng); line-height:1; }
  .circle-sub { font-size:0.55rem; color:var(--td); letter-spacing:0.1em; text-transform:uppercase; margin-top:3px; }
  .progress-stats { width:100%; display:flex; flex-direction:column; gap:10px; }
  .prog-row { display:flex; flex-direction:column; gap:5px; }
  .prog-row-top { display:flex; justify-content:space-between; font-size:0.65rem; }
  .prog-label { color:var(--tm); }
  .prog-val { font-family:var(--fm); color:var(--tb); font-weight:600; }
  .prog-bar-bg { height:4px; background:rgba(255,255,255,0.05); border-radius:4px; overflow:hidden; }
  .prog-bar-fill { height:100%; border-radius:4px; transition:width 1s cubic-bezier(0.4,0,0.2,1); }

  /* Status badge */
  .status-badge { display:inline-flex; align-items:center; gap:5px; padding:3px 9px; border-radius:100px; font-size:0.63rem; font-weight:700; letter-spacing:0.04em; white-space:nowrap; }
  .status-dot { width:5px; height:5px; border-radius:50%; flex-shrink:0; }

  /* Table */
  .marche-table { width:100%; border-collapse:collapse; }
  .marche-table th { padding:9px 20px; font-size:0.6rem; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:var(--td); text-align:left; border-bottom:1px solid rgba(255,255,255,0.05); }
  .marche-table td { padding:11px 20px; font-size:0.76rem; color:#cbd5e1; border-bottom:1px solid rgba(255,255,255,0.04); vertical-align:middle; transition:background 0.15s; }
  .marche-table tbody tr:last-child td { border-bottom:none; }
  .marche-table tbody tr:hover td { background:rgba(0,255,163,0.025); }
  .col-id { font-family:var(--fm); font-size:0.68rem; color:var(--td); }
  .col-objet { color:var(--tb); font-weight:500; }
  .col-montant { font-family:var(--fm); font-size:0.7rem; color:var(--tm); white-space:nowrap; }

  /* Activity */
  .activity-list { padding:4px 0; }
  .activity-item { display:flex; align-items:flex-start; gap:12px; padding:10px 20px; transition:background 0.15s; cursor:default; }
  .activity-item:hover { background:rgba(0,255,163,0.025); }
  .act-icon { width:28px; height:28px; flex-shrink:0; border-radius:8px; background:rgba(0,255,163,0.06); border:1px solid rgba(0,255,163,0.12); display:flex; align-items:center; justify-content:center; font-size:0.8rem; }
  .act-text { font-size:0.73rem; color:#94a3b8; line-height:1.4; font-weight:500; }
  .act-time { font-size:0.6rem; color:var(--td); margin-top:2px; font-family:var(--fm); }

  /* Mini cards */
  .mini-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; padding:14px; }
  .mini-card { background:rgba(0,255,163,0.04); border:1px solid rgba(0,255,163,0.1); border-radius:11px; padding:12px 10px; text-align:center; transition:border-color 0.2s,background 0.2s; }
  .mini-card:hover { border-color:rgba(0,255,163,0.25); background:rgba(0,255,163,0.07); }
  .mini-icon { font-size:1.1rem; margin-bottom:5px; }
  .mini-val { font-family:var(--fd); font-size:0.95rem; font-weight:700; color:var(--ng); line-height:1.1; }
  .mini-lbl { font-size:0.58rem; color:var(--td); text-transform:uppercase; letter-spacing:0.08em; margin-top:3px; }

  /* Animations */
  @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  .fade-up { animation:fadeUp 0.5s ease both; }
  .d1{animation-delay:0.04s} .d2{animation-delay:0.08s} .d3{animation-delay:0.13s}
  .d4{animation-delay:0.18s} .d5{animation-delay:0.23s} .d6{animation-delay:0.28s}
`;

// =============================================================================
// COMPONENTS
// =============================================================================

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="ct-tip">
      <div className="ct-tip-label">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="ct-tip-row">
          <span style={{ color: p.color }}>●</span>
          <span>{p.name}</span>
          <span className="ct-tip-val">{fmtMoney(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function CircleProgress({ pct = 0, label = "" }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t); }, []);
  const offset = circ - (animated ? pct / 100 : 0) * circ;
  return (
    <div className="circle-wrap">
      <svg className="circle-svg" width="130" height="130" viewBox="0 0 130 130">
        <circle className="circle-bg" cx="65" cy="65" r={r} />
        <circle className="circle-fg" cx="65" cy="65" r={r} strokeDasharray={circ} strokeDashoffset={offset} />
      </svg>
      <div className="circle-center">
        <span className="circle-pct">{pct}%</span>
        <span className="circle-sub">{label}</span>
      </div>
    </div>
  );
}

function ProgressRow({ label, value, pct, color }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 500); return () => clearTimeout(t); }, []);
  return (
    <div className="prog-row">
      <div className="prog-row-top">
        <span className="prog-label">{label}</span>
        <span className="prog-val">{value}</span>
      </div>
      <div className="prog-bar-bg">
        <div className="prog-bar-fill" style={{
          width: animated ? `${pct}%` : "0%",
          background: `linear-gradient(90deg,${color},${color}88)`,
          boxShadow: `0 0 8px ${color}55`,
        }} />
      </div>
    </div>
  );
}

function StatusBadge({ statut }) {
  const cfg = STATUS_CONFIG[statut] ?? STATUS_CONFIG["En cours"];
  return (
    <span className="status-badge" style={{ background: cfg.bg, color: cfg.color }}>
      <span className="status-dot" style={{ background: cfg.dot, boxShadow: `0 0 5px ${cfg.dot}` }} />
      {statut}
    </span>
  );
}

function KpiCard({ label, value, icon, delta, trend, sparkIdx = 0 }) {
  const sparkData = SPARKLINE_DATA[sparkIdx % SPARKLINE_DATA.length].map((v, i) => ({ v, i }));
  const isDown = trend < 0;
  return (
    <div className="kpi-card">
      <div className="kpi-top">
        <div className="kpi-icon">{icon}</div>
        <span className={`kpi-trend${isDown ? " down" : ""}`}>
          {isDown ? "↓" : "↑"} {Math.abs(trend)}%
        </span>
      </div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-delta">{delta}</div>
      <div className="kpi-spark">
        <ResponsiveContainer width="100%" height={32}>
          <LineChart data={sparkData}>
            <Line type="monotone" dataKey="v" dot={false} strokeWidth={1.5}
              stroke={isDown ? "#ff4d6d" : "#00ffa3"}
              style={{ filter: `drop-shadow(0 0 4px ${isDown ? "#ff4d6d" : "#00ffa3"})` }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MarchesTable({ rows }) {
  if (!rows.length)
    return <div style={{ padding:"32px 20px", textAlign:"center", color:"var(--td)", fontSize:"0.78rem" }}>Aucun marché à afficher</div>;
  return (
    <table className="marche-table">
      <thead><tr><th>Réf.</th><th>Objet</th><th>Montant</th><th>Statut</th></tr></thead>
      <tbody>
        {rows.map((m) => (
          <tr key={m.id}>
            <td className="col-id">{m.id}</td>
            <td className="col-objet">{m.objet}</td>
            <td className="col-montant">{fmtMoney(m.montant)}</td>
            <td><StatusBadge statut={m.statut} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ActivityFeed({ items }) {
  return (
    <div className="activity-list">
      {items.map((a) => (
        <div key={a.id} className="activity-item">
          <div className="act-icon">{a.icon}</div>
          <div>
            <div className="act-text">{a.text}</div>
            <div className="act-time">{a.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// MAIN DASHBOARD
// =============================================================================

export default function Dashboard() {
  const user = useMemo(() => {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }, []);

  // Replace these mocks with API calls later.
  const totals = useMemo(() => ({ dotation: 0, engage: 0, txEngage: 0, txPaye: 0 }), []);
  const stats  = useMemo(() => ({ actifs: 0, total: 0, top5: [] }), []);

  const kpis = useMemo(() => [
    { label:"Budget Total",   value:fmtMoney(totals.dotation), icon:"💰", delta:`${totals.txPaye.toFixed(1)}% payé`,    trend:8.2,  sparkIdx:0 },
    { label:"Marchés Actifs", value:stats.actifs,              icon:"📋", delta:`${stats.total} total`,                  trend:3.5,  sparkIdx:1 },
    { label:"Engagements",    value:fmtMoney(totals.engage),   icon:"📊", delta:`${totals.txEngage.toFixed(1)}% budget`, trend:-1.2, sparkIdx:2 },
    { label:"Échéances",      value:"—",                       icon:"⏰", delta:"À connecter API",                       trend:0,    sparkIdx:3 },
  ], [totals, stats]);

  const today = new Date().toLocaleDateString("fr-MA", { day:"2-digit", month:"long", year:"numeric" });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="dash-root">
        <div className="dash-inner" style={{ width: "100%", margin: 0, maxWidth: "none" }}>

          {/* HEADER */}
          <header className="dash-header fade-up">
            <div>
              <div className="dash-logo">◈ Portail de Gestion · Marchés Publics</div>
              <h1 className="dash-title">
                Analytics<span> Hub</span>
                {user?.name && <span style={{ color:"var(--tm)", fontWeight:400 }}> · {user.name}</span>}
              </h1>
            </div>
            <div className="dash-pills">
              <div className="dash-pill pill-live"><span className="pill-live-dot" /> Système opérationnel</div>
              <div className="dash-pill pill-date">📅 {today}</div>
            </div>
          </header>

          <div className="glow-divider" />

          {/* KPI CARDS */}
          <div className="kpi-grid">
            {kpis.map((k, i) => (
              <div key={k.label} className={`fade-up d${i + 1}`}>
                <KpiCard {...k} />
              </div>
            ))}
          </div>

          {/* MAIN AREA CHART */}
          <div className="main-chart fade-up d3">
            <div className="chart-hd">
              <div>
                <div className="panel-title" style={{ marginBottom:4 }}>Évolution Budget · 12 mois</div>
                <div style={{ fontSize:"0.65rem", color:"var(--td)" }}>Engagements vs Paiements cumulés (MAD)</div>
              </div>
              <div className="chart-legend">
                <div className="legend-item">
                  <span className="legend-dot" style={{ background:"#00ffa3", boxShadow:"0 0 6px #00ffa3" }} /> Engagé
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background:"#00e0ff", boxShadow:"0 0 6px #00e0ff" }} /> Payé
                </div>
              </div>
            </div>
            <div style={{ padding:"18px 14px 10px" }}>
              <ResponsiveContainer width="100%" height={190}>
                <AreaChart data={BUDGET_TREND} margin={{ top:4, right:4, bottom:0, left:0 }}>
                  <defs>
                    <linearGradient id="gEngage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#00ffa3" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="#00ffa3" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gPaye" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#00e0ff" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#00e0ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="mois" tick={{ fill:"var(--td)", fontSize:10, fontFamily:"DM Mono" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke:"rgba(0,255,163,0.15)", strokeWidth:1 }} />
                  <Area type="monotone" dataKey="engage" name="Engagé" stroke="#00ffa3" strokeWidth={2}
                    fill="url(#gEngage)" dot={false} style={{ filter:"drop-shadow(0 0 5px #00ffa3)" }} />
                  <Area type="monotone" dataKey="paye"   name="Payé"   stroke="#00e0ff" strokeWidth={2}
                    fill="url(#gPaye)"   dot={false} style={{ filter:"drop-shadow(0 0 5px #00e0ff)" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ANALYTICS ROW */}
          <div className="analytics-grid fade-up d4">

            {/* Bar chart */}
            <div className="panel">
              <div className="panel-hd">
                <span className="panel-title">Répartition par Type</span>
                <button className="panel-action">Détail →</button>
              </div>
              <div style={{ padding:"14px 14px 10px" }}>
                <ResponsiveContainer width="100%" height={155}>
                  <BarChart data={MARCHE_BAR} barSize={22} margin={{ top:4, right:0, bottom:0, left:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="type" tick={{ fill:"var(--td)", fontSize:10, fontFamily:"DM Mono" }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ fill:"rgba(0,255,163,0.04)" }}
                      contentStyle={{ background:"rgba(2,12,28,0.95)", border:"1px solid rgba(0,255,163,0.25)", borderRadius:10, fontSize:12, color:"#e2e8f0" }}
                    />
                    <defs>
                      <linearGradient id="barG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00ffa3" />
                        <stop offset="100%" stopColor="#00a363" stopOpacity={0.5} />
                      </linearGradient>
                    </defs>
                    <Bar dataKey="count" name="Marchés" fill="url(#barG)" radius={[5,5,0,0]}
                      style={{ filter:"drop-shadow(0 0 4px rgba(0,255,163,0.35))" }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Progress circle */}
            <div className="panel">
              <div className="panel-hd"><span className="panel-title">Taux d'Exécution</span></div>
              <div className="progress-section">
                <CircleProgress pct={62} label="Payé" />
                <div className="progress-stats">
                  <ProgressRow label="Engagé"  value="78%" pct={78} color="#00ffa3" />
                  <ProgressRow label="Payé"    value="62%" pct={62} color="#00e0ff" />
                  <ProgressRow label="Clôturé" value="34%" pct={34} color="#ffbe00" />
                </div>
              </div>
            </div>

            {/* Mini cards + mini activity */}
            <div className="panel">
              <div className="panel-hd"><span className="panel-title">Indicateurs Clés</span></div>
              <div className="mini-grid">
                {[
                  { icon:"🏆", val:"94%", lbl:"Taux visé" },
                  { icon:"⚡", val:"3j",  lbl:"Délai moy." },
                  { icon:"🔄", val:"12",  lbl:"En attente" },
                  { icon:"✅", val:"28",  lbl:"Clôturés" },
                ].map((m) => (
                  <div key={m.lbl} className="mini-card">
                    <div className="mini-icon">{m.icon}</div>
                    <div className="mini-val">{m.val}</div>
                    <div className="mini-lbl">{m.lbl}</div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop:"1px solid rgba(255,255,255,0.05)", paddingTop:4 }}>
                <div style={{ padding:"8px 20px 4px", fontSize:"0.55rem", color:"var(--td)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.12em" }}>
                  Activité récente
                </div>
                {ACTIVITIES.slice(0, 3).map((a) => (
                  <div key={a.id} className="activity-item">
                    <div className="act-icon">{a.icon}</div>
                    <div>
                      <div className="act-text">{a.text}</div>
                      <div className="act-time">{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BOTTOM ROW */}
          <div className="bottom-grid fade-up d5">
            <div className="panel">
              <div className="panel-hd">
                <span className="panel-title">Marchés Récents</span>
                <button className="panel-action">Voir tout →</button>
              </div>
              <MarchesTable rows={stats.top5} />
            </div>
            <div className="panel">
              <div className="panel-hd">
                <span className="panel-title">Journal d'Activité</span>
                <button className="panel-action">Tout voir →</button>
              </div>
              <ActivityFeed items={ACTIVITIES} />
            </div>
          </div>

        </div>
      </div>
    </>
  );
}