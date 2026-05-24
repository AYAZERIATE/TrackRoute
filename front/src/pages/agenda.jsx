/**
 * Agenda.jsx  ·  TrackRoutes Design System
 * Route: /agenda
 * Fonts needed: Orbitron, Rajdhani, IBM Plex Mono (via Google Fonts)
 * Zero external deps beyond React
 */

import { useState, useEffect, useMemo, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS  ·  TrackRoutes Cyber Neon System
// ─────────────────────────────────────────────────────────────────────────────
const T = {
  // Backgrounds
  bg:         "#020811",
  bgDeep:     "#010508",
  surface:    "rgba(4, 16, 36, 0.92)",
  surfaceAlt: "rgba(6, 20, 46, 0.88)",
  glass:      "rgba(8, 24, 56, 0.72)",
  glassHov:   "rgba(10, 30, 68, 0.88)",

  // Neon palette
  cyan:       "#00d4ff",
  cyanDim:    "rgba(0, 212, 255, 0.15)",
  cyanGlow:   "rgba(0, 212, 255, 0.35)",
  green:      "#00ff88",
  greenDim:   "rgba(0, 255, 136, 0.12)",
  greenGlow:  "rgba(0, 255, 136, 0.3)",
  amber:      "#ffb300",
  amberDim:   "rgba(255, 179, 0, 0.12)",
  amberGlow:  "rgba(255, 179, 0, 0.3)",
  red:        "#ff3d5a",
  redDim:     "rgba(255, 61, 90, 0.12)",
  redGlow:    "rgba(255, 61, 90, 0.3)",
  purple:     "#a855f7",
  purpleDim:  "rgba(168, 85, 247, 0.12)",

  // Text
  textBright: "#e8f4ff",
  text:       "#8ab4d8",
  textDim:    "#3a6080",
  textMuted:  "#1e3a52",

  // Borders
  border:     "rgba(0, 212, 255, 0.12)",
  borderMid:  "rgba(0, 212, 255, 0.22)",
  borderHot:  "rgba(0, 212, 255, 0.55)",

  // Fonts
  fontDisplay: "'Orbitron', 'Rajdhani', monospace",
  fontUI:      "'Rajdhani', 'IBM Plex Mono', sans-serif",
  fontMono:    "'IBM Plex Mono', monospace",
};

// Priority config
const PRIORITY = {
  critical: { label: "CRITIQUE",  color: T.red,    glow: T.redGlow,    dim: T.redDim,    icon: "⬡" },
  high:     { label: "ÉLEVÉE",    color: T.amber,  glow: T.amberGlow,  dim: T.amberDim,  icon: "◆" },
  medium:   { label: "MOYENNE",   color: T.cyan,   glow: T.cyanGlow,   dim: T.cyanDim,   icon: "◇" },
  low:      { label: "BASSE",     color: T.green,  glow: T.greenGlow,  dim: T.greenDim,  icon: "○" },
};

const CATEGORY = {
  reunion:    { label: "Réunion",        color: T.cyan   },
  technique:  { label: "Technique",      color: T.green  },
  audit:      { label: "Audit",          color: T.amber  },
  deadline:   { label: "Échéance",       color: T.red    },
  formation:  { label: "Formation",      color: T.purple },
};

const STATUS = {
  pending:    { label: "EN ATTENTE",  color: T.textDim },
  confirmed:  { label: "CONFIRMÉ",   color: T.green   },
  inprogress: { label: "EN COURS",   color: T.cyan    },
  done:       { label: "TERMINÉ",    color: T.textMuted },
  cancelled:  { label: "ANNULÉ",     color: T.red     },
};

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────────────────────
const pad2 = n => String(n).padStart(2, "0");
const dateStr = (daysOffset, h = 9, m = 0) => {
  const d = new Date(); d.setDate(d.getDate() + daysOffset);
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}T${pad2(h)}:${pad2(m)}:00`;
};

let _id = 1;
const mkEvent = (overrides) => ({ id: _id++, description: "Détails à compléter.", status: "pending", ...overrides });

const INITIAL_EVENTS = [
  mkEvent({ title: "Revue technique RN-1", date: dateStr(0, 9, 0),  priority: "critical", category: "technique", status: "inprogress", description: "Inspection des travaux lot A. Présence obligatoire chef projet." }),
  mkEvent({ title: "Comité de pilotage LF-2025", date: dateStr(0, 14, 30), priority: "high", category: "reunion", status: "confirmed", description: "Point budgétaire et validation des avenants Q2." }),
  mkEvent({ title: "Audit sécurité réseau", date: dateStr(1, 10, 0),  priority: "high", category: "audit", status: "pending", description: "Contrôle conformité sécurité routière RP12." }),
  mkEvent({ title: "Formation BIM 360", date: dateStr(1, 8, 30),  priority: "medium", category: "formation", status: "confirmed", description: "Session initiation plateforme collaborative BIM." }),
  mkEvent({ title: "Réception provisoire pont RR204", date: dateStr(2, 11, 0), priority: "critical", category: "deadline", status: "pending", description: "PVRD lot ouvrages d'art. Présence bureau de contrôle." }),
  mkEvent({ title: "Réunion bénéficiaires M-2025-003", date: dateStr(2, 15, 0), priority: "medium", category: "reunion", status: "pending", description: "Point avancement et levée réserves." }),
  mkEvent({ title: "Échéance visa STGS", date: dateStr(3, 9, 0),  priority: "high", category: "deadline", status: "pending", description: "Dépôt dossier visa direction centrale." }),
  mkEvent({ title: "Inspection terrain RP7", date: dateStr(3, 7, 30), priority: "medium", category: "technique", status: "pending", description: "Relevés géotechniques section 3." }),
  mkEvent({ title: "Séminaire infrastructure 2025", date: dateStr(5, 9, 0), priority: "low", category: "formation", status: "confirmed", description: "Conférence nationale travaux publics." }),
  mkEvent({ title: "Clôture budgétaire LF-2024", date: dateStr(7, 10, 0), priority: "critical", category: "deadline", status: "pending", description: "Soumission rapport final exercice 2024." }),
  mkEvent({ title: "Réunion coordination régionale", date: dateStr(8, 14, 0), priority: "medium", category: "reunion", status: "pending", description: "Synchronisation projets DRER et DPE." }),
  mkEvent({ title: "Audit financier M-2025-001", date: dateStr(10, 9, 0), priority: "high", category: "audit", status: "pending", description: "Vérification pièces justificatives décomptes." }),
  mkEvent({ title: "Lancement appel d'offres RP14", date: dateStr(-1, 10, 0), priority: "high", category: "technique", status: "done", description: "Publication DAO lot réhabilitation." }),
  mkEvent({ title: "Point hebdo équipe projet", date: dateStr(-2, 9, 30), priority: "low", category: "reunion", status: "done", description: "Réunion interne hebdomadaire." }),
];

// ─────────────────────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────────────────────
const toDateKey   = (dt) => dt.slice(0, 10);
const fmtTime     = (dt) => dt ? dt.slice(11, 16) : "--:--";
const fmtDate     = (dt) => {
  if (!dt) return "—";
  const d = new Date(dt);
  return d.toLocaleDateString("fr-MA", { weekday:"short", day:"2-digit", month:"short", year:"numeric" });
};
const fmtShortDate = (dt) => {
  if (!dt) return "—";
  const d = new Date(dt);
  return d.toLocaleDateString("fr-MA", { day:"2-digit", month:"short" });
};
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
};
const diffDays = (dt) => {
  const now = new Date(); now.setHours(0,0,0,0);
  const d   = new Date(dt); d.setHours(0,0,0,0);
  return Math.round((d - now) / 86_400_000);
};
const MONTHS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const DAYS_FR   = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
const getDaysInMonth  = (y, m) => new Date(y, m + 1, 0).getDate();
const getFirstDayOfMonth = (y, m) => (new Date(y, m, 1).getDay() + 6) % 7;

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL CSS
// ─────────────────────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;800;900&family=Rajdhani:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.2); border-radius: 4px; }
  select option { background: #04101e; color: #8ab4d8; }
  input::placeholder { color: rgba(58,96,128,0.7); }
  textarea::placeholder { color: rgba(58,96,128,0.7); }

  @keyframes scanline {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  @keyframes gridPulse {
    0%, 100% { opacity: 0.18; }
    50% { opacity: 0.28; }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-20px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes glowPulse {
    0%, 100% { box-shadow: 0 0 8px rgba(0,212,255,0.3); }
    50%       { box-shadow: 0 0 20px rgba(0,212,255,0.6), 0 0 40px rgba(0,212,255,0.2); }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes cornerPulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.94) translateY(20px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }

  .ag-fadein  { animation: fadeUp 0.4s ease both; }
  .ag-blink   { animation: blink 1.1s step-start infinite; }
  .ag-glow    { animation: glowPulse 2.5s ease-in-out infinite; }
  .ag-spin    { animation: spin 8s linear infinite; }

  .ag-hover-row:hover { background: rgba(0,212,255,0.04) !important; }

  .ag-day-cell:hover {
    border-color: rgba(0,212,255,0.4) !important;
    background: rgba(0,212,255,0.07) !important;
  }
  .ag-event-pill:hover {
    filter: brightness(1.2);
    transform: translateX(2px);
  }
  .ag-sidebar-ev:hover {
    border-left-color: rgba(0,212,255,0.6) !important;
    background: rgba(0,212,255,0.06) !important;
  }
  .ag-neon-btn:hover {
    box-shadow: 0 0 16px rgba(0,212,255,0.5), inset 0 0 8px rgba(0,212,255,0.1) !important;
    border-color: rgba(0,212,255,0.8) !important;
  }
  .ag-filter-pill:hover {
    border-color: rgba(0,212,255,0.5) !important;
    color: #00d4ff !important;
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// ATOMS
// ─────────────────────────────────────────────────────────────────────────────

/** Cyber Panel with corner decorations */
const CyberPanel = ({ children, style = {}, glow = false, accent = T.cyan }) => (
  <div style={{
    position: "relative",
    background: T.glass,
    border: `1px solid ${glow ? accent + "66" : T.border}`,
    borderRadius: 12,
    backdropFilter: "blur(12px)",
    boxShadow: glow
      ? `0 0 20px ${accent}22, inset 0 0 30px rgba(0,0,0,0.4)`
      : "inset 0 0 30px rgba(0,0,0,0.3)",
    ...style,
  }}>
    {/* Corner decorations */}
    {[
      { top: 0, left: 0, borderTop: `2px solid ${accent}`, borderLeft: `2px solid ${accent}`, borderRadius: "12px 0 0 0" },
      { top: 0, right: 0, borderTop: `2px solid ${accent}`, borderRight: `2px solid ${accent}`, borderRadius: "0 12px 0 0" },
      { bottom: 0, left: 0, borderBottom: `2px solid ${accent}`, borderLeft: `2px solid ${accent}`, borderRadius: "0 0 0 12px" },
      { bottom: 0, right: 0, borderBottom: `2px solid ${accent}`, borderRight: `2px solid ${accent}`, borderRadius: "0 0 12px 0" },
    ].map((s, i) => (
      <div key={i} style={{ position: "absolute", width: 14, height: 14, opacity: 0.7, animation: "cornerPulse 3s ease-in-out infinite", animationDelay: `${i * 0.5}s`, ...s }}/>
    ))}
    {children}
  </div>
);

/** Neon Button */
const NeonBtn = ({ children, onClick, color = T.cyan, size = "md", variant = "outline", icon, disabled }) => {
  const pad = size === "sm" ? "6px 12px" : size === "lg" ? "12px 24px" : "9px 16px";
  const fs  = size === "sm" ? "0.62rem" : size === "lg" ? "0.85rem" : "0.72rem";
  const bg  = variant === "solid" ? `${color}22` : "transparent";
  return (
    <button onClick={onClick} disabled={disabled} className="ag-neon-btn" style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: pad, borderRadius: 8,
      background: bg,
      border: `1px solid ${color}55`,
      color, fontFamily: T.fontDisplay, fontSize: fs,
      fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase",
      cursor: disabled ? "not-allowed" : "pointer", outline: "none",
      transition: "all 0.2s", opacity: disabled ? 0.4 : 1,
      whiteSpace: "nowrap",
    }}>
      {icon && <span style={{ fontSize: "1em" }}>{icon}</span>}
      {children}
    </button>
  );
};

/** Stat Badge */
const StatBadge = ({ label, value, color = T.cyan, icon }) => (
  <div style={{
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "12px 18px",
    background: `${color}0d`,
    border: `1px solid ${color}33`,
    borderRadius: 10,
    minWidth: 90,
    boxShadow: `0 0 12px ${color}11`,
  }}>
    {icon && <span style={{ fontSize: "1.1rem", marginBottom: 4 }}>{icon}</span>}
    <span style={{ fontFamily: T.fontDisplay, fontSize: "1.5rem", fontWeight: 900, color, lineHeight: 1 }}>{value}</span>
    <span style={{ fontFamily: T.fontMono, fontSize: "0.55rem", color: T.textDim, marginTop: 4, letterSpacing: "1px", textTransform: "uppercase" }}>{label}</span>
  </div>
);

/** Priority badge */
const PriorityBadge = ({ priority, small }) => {
  const p = PRIORITY[priority] || PRIORITY.medium;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: small ? "1px 7px" : "2px 9px",
      borderRadius: 20,
      background: p.dim,
      border: `1px solid ${p.color}44`,
      color: p.color,
      fontFamily: T.fontMono,
      fontSize: small ? "0.55rem" : "0.6rem",
      fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: p.color, boxShadow: `0 0 4px ${p.glow}`, flexShrink: 0 }}/>
      {p.label}
    </span>
  );
};

/** Category tag */
const CatTag = ({ category, small }) => {
  const c = CATEGORY[category] || CATEGORY.reunion;
  return (
    <span style={{
      padding: small ? "1px 7px" : "2px 8px",
      borderRadius: 4,
      background: `${c.color}15`,
      border: `1px solid ${c.color}33`,
      color: c.color,
      fontFamily: T.fontMono,
      fontSize: small ? "0.55rem" : "0.6rem",
      fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase",
    }}>
      {c.label}
    </span>
  );
};

/** Status indicator */
const StatusDot = ({ status }) => {
  const s = STATUS[status] || STATUS.pending;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, boxShadow: `0 0 5px ${s.color}`, flexShrink: 0 }}/>
      <span style={{ fontFamily: T.fontMono, fontSize: "0.58rem", color: s.color, letterSpacing: "0.8px" }}>{s.label}</span>
    </span>
  );
};

/** Neon input */
const NeonInput = ({ label, value, onChange, type = "text", placeholder, required }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    {label && (
      <label style={{ fontFamily: T.fontMono, fontSize: "0.58rem", color: T.textDim, letterSpacing: "1.5px", textTransform: "uppercase" }}>
        {label}{required && <span style={{ color: T.red, marginLeft: 3 }}>*</span>}
      </label>
    )}
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{
        padding: "9px 12px", borderRadius: 8,
        background: "rgba(0,212,255,0.04)",
        border: `1px solid ${T.borderMid}`,
        color: T.textBright, fontFamily: T.fontUI, fontSize: "0.82rem",
        outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
        width: "100%",
      }}
      onFocus={e => { e.target.style.borderColor = T.cyan; e.target.style.boxShadow = `0 0 10px ${T.cyanGlow}`; }}
      onBlur={e  => { e.target.style.borderColor = T.borderMid; e.target.style.boxShadow = "none"; }}
    />
  </div>
);

/** Neon select */
const NeonSelect = ({ label, value, onChange, options }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    {label && (
      <label style={{ fontFamily: T.fontMono, fontSize: "0.58rem", color: T.textDim, letterSpacing: "1.5px", textTransform: "uppercase" }}>{label}</label>
    )}
    <div style={{ position: "relative" }}>
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        width: "100%", padding: "9px 30px 9px 12px", borderRadius: 8,
        background: "rgba(0,212,255,0.04)", border: `1px solid ${T.borderMid}`,
        color: T.textBright, fontFamily: T.fontUI, fontSize: "0.82rem",
        outline: "none", appearance: "none", cursor: "pointer",
      }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: T.textDim, pointerEvents: "none", fontSize: "0.7rem" }}>▾</span>
    </div>
  </div>
);

/** Divider */
const Div = ({ accent }) => (
  <div style={{ height: 1, background: accent ? `linear-gradient(90deg,transparent,${accent}55,transparent)` : T.border, margin: "14px 0" }}/>
);

// ─────────────────────────────────────────────────────────────────────────────
// CLOCK
// ─────────────────────────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const hh = pad2(time.getHours()), mm = pad2(time.getMinutes()), ss = pad2(time.getSeconds());
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontFamily: T.fontDisplay, fontSize: "1.1rem", fontWeight: 700, color: T.cyan, letterSpacing: "2px" }}>
        {hh}<span className="ag-blink" style={{ opacity: 0.8 }}>:</span>{mm}
      </span>
      <span style={{ fontFamily: T.fontMono, fontSize: "0.7rem", color: T.textDim }}>:{ss}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CALENDAR GRID
// ─────────────────────────────────────────────────────────────────────────────
function CalendarGrid({ events, selectedDay, onSelectDay, year, month, onPrev, onNext }) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay    = getFirstDayOfMonth(year, month);
  const todayK      = todayKey();

  const eventsByDate = useMemo(() => {
    const m = {};
    events.forEach(ev => {
      const k = toDateKey(ev.date);
      if (!m[k]) m[k] = [];
      m[k].push(ev);
    });
    return m;
  }, [events]);

  return (
    <CyberPanel style={{ padding: "20px 18px", flex: 1, minWidth: 0 }}>
      {/* Month nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <NeonBtn onClick={onPrev} icon="◀" size="sm" color={T.cyan}/>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: T.fontDisplay, fontSize: "0.95rem", fontWeight: 800, color: T.textBright, letterSpacing: "3px", textTransform: "uppercase" }}>
            {MONTHS_FR[month]}
          </div>
          <div style={{ fontFamily: T.fontMono, fontSize: "0.65rem", color: T.textDim, letterSpacing: "2px" }}>{year}</div>
        </div>
        <NeonBtn onClick={onNext} icon="▶" size="sm" color={T.cyan}/>
      </div>

      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginBottom: 6 }}>
        {DAYS_FR.map(d => (
          <div key={d} style={{ textAlign: "center", fontFamily: T.fontMono, fontSize: "0.58rem", fontWeight: 700, color: T.textMuted, letterSpacing: "1px", padding: "4px 0" }}>{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e${i}`} style={{ aspectRatio: "1" }}/>
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateK = `${year}-${pad2(month+1)}-${pad2(day)}`;
          const dayEvs = eventsByDate[dateK] || [];
          const isToday = dateK === todayK;
          const isSel   = dateK === selectedDay;
          const hasCrit = dayEvs.some(e => e.priority === "critical");
          const hasHigh = dayEvs.some(e => e.priority === "high");

          return (
            <div key={day} className="ag-day-cell"
              onClick={() => onSelectDay(dateK, dayEvs)}
              style={{
                aspectRatio: "1", borderRadius: 8, padding: "4px 3px",
                background: isSel
                  ? `${T.cyan}18`
                  : isToday ? `${T.green}0f` : "rgba(0,212,255,0.02)",
                border: `1px solid ${isSel ? T.cyan + "99" : isToday ? T.green + "66" : T.border}`,
                cursor: "pointer", position: "relative", transition: "all 0.15s",
                boxShadow: isToday ? `0 0 10px ${T.greenGlow}` : isSel ? `0 0 10px ${T.cyanGlow}` : "none",
              }}>
              <div style={{ textAlign: "center", fontFamily: T.fontDisplay, fontSize: "0.62rem", fontWeight: isToday ? 900 : 500, color: isToday ? T.green : isSel ? T.cyan : T.text, lineHeight: 1 }}>{day}</div>
              {dayEvs.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 2, marginTop: 2 }}>
                  {dayEvs.slice(0, 3).map(ev => {
                    const p = PRIORITY[ev.priority] || PRIORITY.medium;
                    return (
                      <div key={ev.id} style={{
                        width: 5, height: 5, borderRadius: "50%",
                        background: p.color,
                        boxShadow: `0 0 4px ${p.glow}`,
                      }}/>
                    );
                  })}
                  {dayEvs.length > 3 && (
                    <span style={{ fontFamily: T.fontMono, fontSize: "0.45rem", color: T.textDim }}>+{dayEvs.length - 3}</span>
                  )}
                </div>
              )}
              {/* Urgent warning flash */}
              {(hasCrit || hasHigh) && (
                <div style={{ position: "absolute", top: 2, right: 2, width: 5, height: 5, borderRadius: "50%", background: hasCrit ? T.red : T.amber, boxShadow: `0 0 6px ${hasCrit ? T.redGlow : T.amberGlow}`, animation: "glowPulse 1.5s ease-in-out infinite" }}/>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <Div accent={T.cyan}/>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px" }}>
        {Object.entries(PRIORITY).map(([k, p]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.color, boxShadow: `0 0 4px ${p.glow}` }}/>
            <span style={{ fontFamily: T.fontMono, fontSize: "0.57rem", color: T.textDim }}>{p.label}</span>
          </div>
        ))}
      </div>
    </CyberPanel>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DAY EVENTS PANEL
// ─────────────────────────────────────────────────────────────────────────────
function DayPanel({ selectedDay, dayEvents, onEditEvent, onDeleteEvent }) {
  const label = selectedDay
    ? new Date(selectedDay + "T00:00:00").toLocaleDateString("fr-MA", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })
    : "Sélectionnez un jour";

  return (
    <CyberPanel style={{ padding: "18px 16px", flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontFamily: T.fontDisplay, fontSize: "0.6rem", color: T.cyan, letterSpacing: "2px", textTransform: "uppercase" }}>◈ JOUR SÉLECTIONNÉ</span>
      </div>
      <div style={{ fontFamily: T.fontUI, fontSize: "0.82rem", fontWeight: 700, color: T.textBright, marginBottom: 14, textTransform: "capitalize" }}>
        {label}
      </div>

      {dayEvents.length === 0 ? (
        <div style={{ textAlign: "center", padding: "30px 10px" }}>
          <div style={{ fontFamily: T.fontMono, fontSize: "0.65rem", color: T.textMuted, letterSpacing: "1px" }}>— AUCUN ÉVÉNEMENT —</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 380, overflowY: "auto" }}>
          {dayEvents.sort((a, b) => a.date.localeCompare(b.date)).map(ev => {
            const p = PRIORITY[ev.priority] || PRIORITY.medium;
            return (
              <div key={ev.id} className="ag-sidebar-ev" style={{
                padding: "10px 12px",
                background: `${p.color}08`,
                border: `1px solid ${p.color}22`,
                borderLeft: `3px solid ${p.color}`,
                borderRadius: 8,
                cursor: "pointer", transition: "all 0.15s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6, marginBottom: 5 }}>
                  <span style={{ fontFamily: T.fontUI, fontSize: "0.78rem", fontWeight: 700, color: T.textBright, flex: 1 }}>{ev.title}</span>
                  <span style={{ fontFamily: T.fontMono, fontSize: "0.7rem", color: p.color, whiteSpace: "nowrap" }}>{fmtTime(ev.date)}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                  <PriorityBadge priority={ev.priority} small/>
                  <CatTag category={ev.category} small/>
                  <StatusDot status={ev.status}/>
                </div>
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", marginTop: 4 }}>
                  <NeonBtn size="sm" color={T.cyan} onClick={() => onEditEvent(ev)} icon="✎">Modifier</NeonBtn>
                  <NeonBtn size="sm" color={T.red}  onClick={() => onDeleteEvent(ev.id)} icon="✕">Suppr.</NeonBtn>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </CyberPanel>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
function AgendaSideBlock({ title, accent, children, count }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
        <div style={{ width: 3, height: 14, background: accent, borderRadius: 2, boxShadow: `0 0 6px ${accent}` }}/>
        <span style={{ fontFamily: T.fontDisplay, fontSize: "0.58rem", color: accent, letterSpacing: "2px", textTransform: "uppercase" }}>{title}</span>
        {count !== undefined && (
          <span style={{ marginLeft: "auto", padding: "1px 7px", borderRadius: 10, background: `${accent}18`, border: `1px solid ${accent}33`, color: accent, fontFamily: T.fontMono, fontSize: "0.57rem", fontWeight: 700 }}>{count}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function AgendaSideEvent({ ev, onSelectEvent }) {
  const p = PRIORITY[ev.priority] || PRIORITY.medium;
  return (
    <div className="ag-sidebar-ev" onClick={() => onSelectEvent(ev)} style={{
      padding: "8px 10px", borderRadius: 7,
      borderLeft: `2px solid ${p.color}88`,
      background: `${p.color}06`,
      marginBottom: 5, cursor: "pointer", transition: "all 0.15s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 4, marginBottom: 3 }}>
        <span style={{ fontFamily: T.fontUI, fontSize: "0.72rem", fontWeight: 600, color: T.text, flex: 1, lineHeight: 1.3 }}>{ev.title}</span>
        <span style={{ fontFamily: T.fontMono, fontSize: "0.6rem", color: p.color, whiteSpace: "nowrap" }}>{fmtTime(ev.date)}</span>
      </div>
      <PriorityBadge priority={ev.priority} small/>
    </div>
  );
}

function AgendaSidebar({ events, onSelectEvent }) {
  const now = todayKey();

  const todayEvs   = events.filter(e => toDateKey(e.date) === now && e.status !== "done" && e.status !== "cancelled");
  const urgent     = events.filter(e => { const d = diffDays(e.date); return d >= 0 && d <= 3 && e.priority === "critical"; });
  const upcoming   = events.filter(e => { const d = diffDays(e.date); return d > 0 && d <= 7; })
                           .sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);

  return (
    <CyberPanel style={{ padding: "18px 14px", width: 260, flexShrink: 0, overflowY: "auto", maxHeight: "100%" }}>
      <div style={{ fontFamily: T.fontDisplay, fontSize: "0.6rem", color: T.cyan, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 16, paddingBottom: 10, borderBottom: `1px solid ${T.border}` }}>
        ◈ PANNEAU LATÉRAL
      </div>

      {/* Quick stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 16 }}>
        {[
          { label: "Aujourd'hui", value: todayEvs.length, color: T.cyan },
          { label: "Urgents",     value: urgent.length,   color: T.red  },
          { label: "Cette semaine", value: upcoming.length, color: T.amber },
          { label: "Total actifs", value: events.filter(e => e.status !== "done").length, color: T.green },
        ].map(s => (
          <div key={s.label} style={{
            padding: "8px 10px", borderRadius: 8,
            background: `${s.color}0d`, border: `1px solid ${s.color}25`,
            textAlign: "center",
          }}>
            <div style={{ fontFamily: T.fontDisplay, fontSize: "1.1rem", fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontFamily: T.fontMono, fontSize: "0.5rem", color: T.textDim, letterSpacing: "0.8px", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <Div accent={T.cyan}/>

      <AgendaSideBlock title="Aujourd'hui" accent={T.cyan} count={todayEvs.length}>
        {todayEvs.length === 0
          ? <div style={{ fontFamily: T.fontMono, fontSize: "0.62rem", color: T.textMuted, textAlign: "center", padding: "8px 0" }}>Aucun événement</div>
          : todayEvs.map(ev => <AgendaSideEvent key={ev.id} ev={ev} onSelectEvent={onSelectEvent}/>)
        }
      </AgendaSideBlock>

      <Div accent={T.red}/>

      <AgendaSideBlock title="Urgents" accent={T.red} count={urgent.length}>
        {urgent.length === 0
          ? <div style={{ fontFamily: T.fontMono, fontSize: "0.62rem", color: T.textMuted, textAlign: "center", padding: "8px 0" }}>Aucun critique</div>
          : urgent.slice(0, 4).map(ev => <AgendaSideEvent key={ev.id} ev={ev} onSelectEvent={onSelectEvent}/>)
        }
      </AgendaSideBlock>

      <Div accent={T.amber}/>

      <AgendaSideBlock title="7 prochains jours" accent={T.amber} count={upcoming.length}>
        {upcoming.length === 0
          ? <div style={{ fontFamily: T.fontMono, fontSize: "0.62rem", color: T.textMuted, textAlign: "center", padding: "8px 0" }}>Aucun à venir</div>
          : upcoming.map(ev => <AgendaSideEvent key={ev.id} ev={ev} onSelectEvent={onSelectEvent}/>)
        }
      </AgendaSideBlock>
    </CyberPanel>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL FORM
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  title: "", description: "", date: "", time: "09:00",
  priority: "medium", status: "pending", category: "reunion",
};

function EventModal({ open, onClose, onSave, editEvent }) {
  const [form, setForm] = useState(() => {
    if (!editEvent) return EMPTY_FORM;
    return {
      title:       editEvent.title || "",
      description: editEvent.description || "",
      date:        editEvent.date ? toDateKey(editEvent.date) : "",
      time:        editEvent.date ? fmtTime(editEvent.date) : "09:00",
      priority:    editEvent.priority || "medium",
      status:      editEvent.status || "pending",
      category:    editEvent.category || "reunion",
    };
  });
  const [errors, setErrors] = useState({});

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Titre requis";
    if (!form.date) e.date = "Date requise";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const fullDate = `${form.date}T${form.time}:00`;
    onSave({ title: form.title, description: form.description, date: fullDate, priority: form.priority, status: form.status, category: form.category });
    onClose();
  };

  if (!open) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2000,
      background: "rgba(1,5,14,0.82)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      animation: "fadeIn 0.2s ease both",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 520,
        background: "rgba(4,14,36,0.97)",
        border: `1px solid ${T.cyan}55`,
        borderRadius: 16,
        padding: "28px 26px",
        boxShadow: `0 0 60px ${T.cyanGlow}, 0 32px 80px rgba(0,0,0,0.8)`,
        animation: "modalIn 0.3s ease both",
        position: "relative", overflow: "hidden",
      }}>
        {/* Corner deco */}
        {[[{ top:0,left:0 }, "borderTop","borderLeft"],
          [{ top:0,right:0 }, "borderTop","borderRight"],
          [{ bottom:0,left:0 }, "borderBottom","borderLeft"],
          [{ bottom:0,right:0 }, "borderBottom","borderRight"],
        ].map(([pos, b1, b2], i) => (
          <div key={i} style={{ position:"absolute", width:16, height:16, [b1]: `2px solid ${T.cyan}`, [b2]: `2px solid ${T.cyan}`, ...pos, opacity: 0.7 }}/>
        ))}

        {/* Scanline */}
        <div style={{ position:"absolute", inset:0, background:`repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,212,255,0.015) 2px,rgba(0,212,255,0.015) 4px)`, pointerEvents:"none", borderRadius:16 }}/>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}>
          <div>
            <div style={{ fontFamily:T.fontDisplay, fontSize:"0.6rem", color:T.cyan, letterSpacing:"3px", textTransform:"uppercase", marginBottom:4 }}>
              ◈ {editEvent ? "MODIFIER" : "NOUVEL"} ÉVÉNEMENT
            </div>
            <h2 style={{ fontFamily:T.fontDisplay, fontSize:"1rem", fontWeight:900, color:T.textBright, letterSpacing:"1px" }}>
              {editEvent ? "Modification" : "Création"} · Agenda Central
            </h2>
          </div>
          <NeonBtn onClick={onClose} icon="✕" size="sm" color={T.red}/>
        </div>

        <Div accent={T.cyan}/>

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <NeonInput label="Titre" value={form.title} onChange={set("title")} placeholder="Intitulé de l'événement" required/>
          {errors.title && <span style={{ fontFamily:T.fontMono, fontSize:"0.58rem", color:T.red }}>{errors.title}</span>}

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <NeonInput label="Date" type="date" value={form.date} onChange={set("date")} required/>
            <NeonInput label="Heure" type="time" value={form.time} onChange={set("time")}/>
          </div>
          {errors.date && <span style={{ fontFamily:T.fontMono, fontSize:"0.58rem", color:T.red }}>{errors.date}</span>}

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
            <NeonSelect label="Priorité" value={form.priority} onChange={set("priority")}
              options={Object.entries(PRIORITY).map(([v,p]) => ({ value:v, label:p.label }))}/>
            <NeonSelect label="Statut" value={form.status} onChange={set("status")}
              options={Object.entries(STATUS).map(([v,s]) => ({ value:v, label:s.label }))}/>
            <NeonSelect label="Catégorie" value={form.category} onChange={set("category")}
              options={Object.entries(CATEGORY).map(([v,c]) => ({ value:v, label:c.label }))}/>
          </div>

          {/* Description */}
          <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
            <label style={{ fontFamily:T.fontMono, fontSize:"0.58rem", color:T.textDim, letterSpacing:"1.5px", textTransform:"uppercase" }}>Description</label>
            <textarea value={form.description} onChange={e => set("description")(e.target.value)}
              rows={3} placeholder="Détails, notes, instructions…"
              style={{
                padding:"9px 12px", borderRadius:8, resize:"vertical",
                background:"rgba(0,212,255,0.04)", border:`1px solid ${T.borderMid}`,
                color:T.textBright, fontFamily:T.fontUI, fontSize:"0.8rem",
                outline:"none", transition:"border-color 0.2s",
              }}
              onFocus={e => { e.target.style.borderColor=T.cyan; e.target.style.boxShadow=`0 0 10px ${T.cyanGlow}`; }}
              onBlur={e  => { e.target.style.borderColor=T.borderMid; e.target.style.boxShadow="none"; }}
            />
          </div>
        </div>

        <Div accent={T.cyan}/>

        <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
          <NeonBtn onClick={onClose} color={T.textDim} size="md" icon="✕">Annuler</NeonBtn>
          <NeonBtn onClick={handleSave} color={T.green} size="md" variant="outline" icon="✓">
            {editEvent ? "Enregistrer" : "Créer l'événement"}
          </NeonBtn>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LIST VIEW
// ─────────────────────────────────────────────────────────────────────────────
function ListView({ events, onEdit, onDelete, searchQ, filterPriority, filterCat, filterStatus }) {
  const filtered = useMemo(() => {
    return events.filter(ev => {
      const q = searchQ.toLowerCase();
      const matchQ   = !q || ev.title.toLowerCase().includes(q) || (ev.description || "").toLowerCase().includes(q);
      const matchP   = filterPriority === "all" || ev.priority === filterPriority;
      const matchC   = filterCat === "all" || ev.category === filterCat;
      const matchS   = filterStatus === "all" || ev.status === filterStatus;
      return matchQ && matchP && matchC && matchS;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [events, searchQ, filterPriority, filterCat, filterStatus]);

  const [hovRow, setHovRow] = useState(null);

  return (
    <CyberPanel style={{ overflow: "hidden" }}>
      {/* Table header */}
      <div style={{
        display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto",
        gap: 0, padding: "10px 16px",
        borderBottom: `1px solid ${T.border}`,
        background: "rgba(0,212,255,0.04)",
      }}>
        {["Événement","Date","Priorité","Catégorie","Statut","Actions"].map(h => (
          <div key={h} style={{ fontFamily: T.fontDisplay, fontSize: "0.55rem", fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase", color: T.textDim }}>{h}</div>
        ))}
      </div>

      <div style={{ maxHeight: 520, overflowY: "auto" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", fontFamily: T.fontMono, fontSize: "0.7rem", color: T.textMuted }}>
            — AUCUN RÉSULTAT —
          </div>
        ) : filtered.map((ev, i) => {
          const p = PRIORITY[ev.priority] || PRIORITY.medium;
          return (
            <div key={ev.id} className="ag-hover-row"
              onMouseEnter={() => setHovRow(ev.id)} onMouseLeave={() => setHovRow(null)}
              style={{
                display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto",
                gap: 0, padding: "11px 16px",
                borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none",
                borderLeft: `2px solid ${hovRow === ev.id ? p.color : "transparent"}`,
                transition: "all 0.15s", alignItems: "center",
                background: hovRow === ev.id ? `${p.color}06` : "transparent",
              }}>
              <div>
                <div style={{ fontFamily: T.fontUI, fontSize: "0.8rem", fontWeight: 600, color: T.textBright, marginBottom: 2 }}>{ev.title}</div>
                {ev.description && (
                  <div style={{ fontFamily: T.fontUI, fontSize: "0.67rem", color: T.textDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 280 }}>{ev.description}</div>
                )}
              </div>
              <div title={fmtShortDate(ev.date)}>
                <div style={{ fontFamily: T.fontMono, fontSize: "0.68rem", color: T.text }}>{fmtDate(ev.date)}</div>
                <div style={{ fontFamily: T.fontMono, fontSize: "0.62rem", color: T.textDim }}>{fmtTime(ev.date)}</div>
              </div>
              <div><PriorityBadge priority={ev.priority} small/></div>
              <div><CatTag category={ev.category} small/></div>
              <div><StatusDot status={ev.status}/></div>
              <div style={{ display: "flex", gap: 5 }}>
                <NeonBtn size="sm" color={T.cyan} onClick={() => onEdit(ev)} icon="✎"/>
                <NeonBtn size="sm" color={T.red}  onClick={() => onDelete(ev.id)} icon="✕"/>
              </div>
            </div>
          );
        })}
      </div>
    </CyberPanel>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function Agenda() {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [view, setView] = useState("calendar"); // calendar | list
  const [calYear,  setCalYear]  = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [selectedDay,  setSelectedDay]  = useState(todayKey());
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState(null);

  // Filters
  const [searchQ,       setSearchQ]       = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterCat,     setFilterCat]     = useState("all");
  const [filterStatus,  setFilterStatus]  = useState("all");

  const selectedDayEvs = useMemo(() => {
    if (!selectedDay) return [];
    return events.filter((e) => toDateKey(e.date) === selectedDay);
  }, [events, selectedDay]);

  const handleSelectDay = useCallback((dateK) => {
    setSelectedDay(dateK);
  }, []);

  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0);  setCalYear(y => y + 1); } else setCalMonth(m => m + 1); };

  const openCreate = () => { setEditEvent(null); setModalOpen(true); };
  const openEdit   = (ev) => { setEditEvent(ev); setModalOpen(true); };

  const handleSave = (data) => {
    if (editEvent) {
      setEvents(evs => evs.map(e => e.id === editEvent.id ? { ...e, ...data } : e));
    } else {
      setEvents(evs => [...evs, { id: Date.now(), ...data }]);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Supprimer cet événement ?")) {
      setEvents(evs => evs.filter(e => e.id !== id));
    }
  };

  // Stats
  const now = todayKey();
  const stats = useMemo(() => ({
    total:    events.length,
    today:    events.filter(e => toDateKey(e.date) === now).length,
    critical: events.filter(e => e.priority === "critical" && e.status !== "done").length,
    done:     events.filter(e => e.status === "done").length,
    upcoming: events.filter(e => { const d = diffDays(e.date); return d > 0 && d <= 7; }).length,
  }), [events, now]);

  const VIEW_TABS = [
    { id: "calendar", label: "CALENDRIER", icon: "◫" },
    { id: "list",     label: "LISTE",      icon: "≡" },
  ];

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      {/* Background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, background: T.bg, overflow: "hidden", pointerEvents: "none" }}>
        {/* Cyber grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `
            linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          animation: "gridPulse 6s ease-in-out infinite",
        }}/>
        {/* Radial glow */}
        <div style={{ position:"absolute", top:"20%", left:"50%", transform:"translateX(-50%)", width:900, height:500, background:`radial-gradient(ellipse at center, ${T.cyan}07 0%, transparent 70%)`, borderRadius:"50%", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", bottom:"10%", left:"10%", width:400, height:400, background:`radial-gradient(ellipse, ${T.green}05 0%, transparent 70%)`, borderRadius:"50%" }}/>
        <div style={{ position:"absolute", top:"30%", right:"5%", width:300, height:300, background:`radial-gradient(ellipse, ${T.amber}04 0%, transparent 70%)`, borderRadius:"50%" }}/>
        {/* Scanline */}
        <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:`linear-gradient(90deg,transparent,${T.cyan}33,transparent)`, animation:"scanline 8s linear infinite", opacity:0.6 }}/>
      </div>

      {/* MAIN LAYOUT */}
      <div className="ag-fadein" style={{
        position: "relative", zIndex: 1,
        minHeight: "100vh",
        fontFamily: T.fontUI,
        color: T.text,
        display: "flex", flexDirection: "column",
        padding: "20px 20px 24px",
        gap: 18,
        maxWidth: 1440, margin: "0 auto",
      }}>

        {/* ── HEADER ── */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 14,
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {/* System indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: `${T.green}12`, border: `1px solid ${T.green}33` }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, boxShadow: `0 0 8px ${T.greenGlow}`, animation: "glowPulse 2s ease-in-out infinite" }}/>
                <span style={{ fontFamily: T.fontMono, fontSize: "0.55rem", color: T.green, letterSpacing: "1.5px" }}>SYSTÈME ACTIF</span>
              </div>
              <span style={{ fontFamily: T.fontMono, fontSize: "0.55rem", color: T.textMuted, letterSpacing: "1px" }}>
                TRACKROUTES · MODULE AGENDA · v2.5.0
              </span>
            </div>

            {/* Title */}
            <h1 style={{ fontFamily: T.fontDisplay, fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900, color: T.textBright, letterSpacing: "4px", textTransform: "uppercase", lineHeight: 1,
              textShadow: `0 0 20px ${T.cyanGlow}, 0 0 40px ${T.cyan}33` }}>
              AGENDA CENTRAL
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: T.fontMono, fontSize: "0.62rem", color: T.textDim, letterSpacing: "1px" }}>
                &gt;_ Gestion des Échéances et Rendez-vous
              </span>
              <span className="ag-blink" style={{ fontFamily: T.fontMono, fontSize: "0.62rem", color: T.cyan }}>█</span>
            </div>
          </div>

          {/* Clock + Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, padding: "8px 14px", background: T.cyanDim, border: `1px solid ${T.border}`, borderRadius: 10 }}>
              <LiveClock/>
              <span style={{ fontFamily: T.fontMono, fontSize: "0.55rem", color: T.textDim, letterSpacing: "1px" }}>
                {new Date().toLocaleDateString("fr-MA", { weekday:"long", day:"2-digit", month:"long", year:"numeric" })}
              </span>
            </div>
            <NeonBtn onClick={openCreate} icon="+" variant="outline" color={T.green} size="md">
              Nouvel Événement
            </NeonBtn>
          </div>
        </header>

        {/* ── STATS BAR ── */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <StatBadge label="Total Événements" value={stats.total}    color={T.cyan}  icon="◈"/>
          <StatBadge label="Aujourd'hui"       value={stats.today}   color={T.green} icon="◉"/>
          <StatBadge label="Critiques"         value={stats.critical} color={T.red}  icon="⬡"/>
          <StatBadge label="Cette semaine"     value={stats.upcoming} color={T.amber} icon="◆"/>
          <StatBadge label="Terminés"          value={stats.done}    color={T.textDim} icon="○"/>
        </div>

        {/* ── VIEW TABS + FILTERS ── */}
        <CyberPanel style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            {/* Tabs */}
            <div style={{ display: "flex", gap: 6, padding: "3px", background: `rgba(0,212,255,0.04)`, borderRadius: 10, border: `1px solid ${T.border}` }}>
              {VIEW_TABS.map(tab => (
                <button key={tab.id} onClick={() => setView(tab.id)} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 14px", borderRadius: 7,
                  background: view === tab.id ? `${T.cyan}18` : "transparent",
                  border: view === tab.id ? `1px solid ${T.cyan}55` : "1px solid transparent",
                  color: view === tab.id ? T.cyan : T.textDim,
                  fontFamily: T.fontDisplay, fontSize: "0.6rem", fontWeight: 800,
                  letterSpacing: "2px", cursor: "pointer", outline: "none", transition: "all 0.15s",
                  boxShadow: view === tab.id ? `0 0 10px ${T.cyanGlow}` : "none",
                }}>
                  <span>{tab.icon}</span> {tab.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.textDim, fontFamily: T.fontMono, fontSize: "0.8rem", pointerEvents: "none" }}>⌕</span>
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Rechercher…"
                style={{
                  width: "100%", padding: "8px 10px 8px 30px", borderRadius: 8,
                  background: "rgba(0,212,255,0.04)", border: `1px solid ${T.borderMid}`,
                  color: T.textBright, fontFamily: T.fontUI, fontSize: "0.78rem", outline: "none",
                }}
                onFocus={e => { e.target.style.borderColor = T.cyan; e.target.style.boxShadow = `0 0 8px ${T.cyanGlow}`; }}
                onBlur={e  => { e.target.style.borderColor = T.borderMid; e.target.style.boxShadow = "none"; }}
              />
              {searchQ && <button onClick={() => setSearchQ("")} style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:T.textDim, cursor:"pointer", fontSize:"0.75rem" }}>✕</button>}
            </div>

            {/* Filter pills */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              {/* Priority filter */}
              <div style={{ position: "relative" }}>
                <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{
                  padding: "7px 28px 7px 10px", borderRadius: 8, appearance: "none",
                  background: "rgba(0,212,255,0.04)", border: `1px solid ${T.borderMid}`,
                  color: T.text, fontFamily: T.fontDisplay, fontSize: "0.6rem", letterSpacing: "1px",
                  cursor: "pointer", outline: "none",
                }}>
                  <option value="all">PRIORITÉ</option>
                  {Object.entries(PRIORITY).map(([v, p]) => <option key={v} value={v}>{p.label}</option>)}
                </select>
                <span style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", color:T.textDim, fontSize:"0.65rem", pointerEvents:"none" }}>▾</span>
              </div>

              <div style={{ position: "relative" }}>
                <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{
                  padding: "7px 28px 7px 10px", borderRadius: 8, appearance: "none",
                  background: "rgba(0,212,255,0.04)", border: `1px solid ${T.borderMid}`,
                  color: T.text, fontFamily: T.fontDisplay, fontSize: "0.6rem", letterSpacing: "1px",
                  cursor: "pointer", outline: "none",
                }}>
                  <option value="all">CATÉGORIE</option>
                  {Object.entries(CATEGORY).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                </select>
                <span style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", color:T.textDim, fontSize:"0.65rem", pointerEvents:"none" }}>▾</span>
              </div>

              <div style={{ position: "relative" }}>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{
                  padding: "7px 28px 7px 10px", borderRadius: 8, appearance: "none",
                  background: "rgba(0,212,255,0.04)", border: `1px solid ${T.borderMid}`,
                  color: T.text, fontFamily: T.fontDisplay, fontSize: "0.6rem", letterSpacing: "1px",
                  cursor: "pointer", outline: "none",
                }}>
                  <option value="all">STATUT</option>
                  {Object.entries(STATUS).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}
                </select>
                <span style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", color:T.textDim, fontSize:"0.65rem", pointerEvents:"none" }}>▾</span>
              </div>

              {(filterPriority !== "all" || filterCat !== "all" || filterStatus !== "all" || searchQ) && (
                <NeonBtn size="sm" color={T.red} onClick={() => { setFilterPriority("all"); setFilterCat("all"); setFilterStatus("all"); setSearchQ(""); }} icon="✕">Reset</NeonBtn>
              )}
            </div>
          </div>
        </CyberPanel>

        {/* ── MAIN CONTENT ── */}
        {view === "calendar" ? (
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flex: 1, minHeight: 0 }}>
            {/* Left: Calendar + Day panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1, minWidth: 0 }}>
              <CalendarGrid
                events={events}
                selectedDay={selectedDay}
                onSelectDay={handleSelectDay}
                year={calYear} month={calMonth}
                onPrev={prevMonth} onNext={nextMonth}
              />
              <DayPanel
                selectedDay={selectedDay}
                dayEvents={selectedDayEvs}
                onEditEvent={openEdit}
                onDeleteEvent={handleDelete}
              />
            </div>

            {/* Right: Sidebar */}
            <AgendaSidebar events={events} onSelectEvent={openEdit}/>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <ListView
                events={events}
                onEdit={openEdit}
                onDelete={handleDelete}
                searchQ={searchQ}
                filterPriority={filterPriority}
                filterCat={filterCat}
                filterStatus={filterStatus}
              />
            </div>
            <AgendaSidebar events={events} onSelectEvent={openEdit}/>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
          <span style={{ fontFamily: T.fontMono, fontSize: "0.55rem", color: T.textMuted, letterSpacing: "1px" }}>
            TRACKROUTES · AGENDA CENTRAL · {events.length} ÉVÉNEMENTS CHARGÉS
          </span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.green, boxShadow: `0 0 6px ${T.greenGlow}`, animation: "glowPulse 2s ease-in-out infinite" }}/>
            <span style={{ fontFamily: T.fontMono, fontSize: "0.55rem", color: T.textMuted }}>ONLINE</span>
          </div>
        </div>
      </div>

      {/* ── MODAL ── */}
      <EventModal
        key={`${modalOpen ? "open" : "closed"}-${editEvent?.id ?? "new"}`}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditEvent(null); }}
        onSave={handleSave}
        editEvent={editEvent}
      />
    </>
  );
}
