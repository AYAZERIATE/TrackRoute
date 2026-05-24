import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

/* ─── DESIGN TOKENS ─────────────────────────────────────────────────────── */
const T = {
  bg:         "#020b14",
  bgDeep:     "#010810",
  panel:      "rgba(4, 20, 35, 0.82)",
  panelHover: "rgba(6, 28, 50, 0.95)",
  cyan:       "#00e5ff",
  cyanDim:    "rgba(0,229,255,0.12)",
  cyanGlow:   "rgba(0,229,255,0.35)",
  green:      "#00ff88",
  greenDim:   "rgba(0,255,136,0.10)",
  greenGlow:  "rgba(0,255,136,0.3)",
  amber:      "#ffb300",
  amberDim:   "rgba(255,179,0,0.12)",
  red:        "#ff4466",
  border:     "rgba(0,229,255,0.10)",
  borderMid:  "rgba(0,229,255,0.22)",
  text:       "#cce8f4",
  textMuted:  "rgba(140,190,220,0.5)",
  textDim:    "rgba(80,130,160,0.45)",
  gridLine:   "rgba(0,229,255,0.035)",
  font:       "'Rajdhani', 'Orbitron', monospace",
  fontBody:   "'IBM Plex Mono', 'Courier New', monospace",
};

/* ─── GLOBAL STYLES ──────────────────────────────────────────────────────── */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@400;600;700;800;900&family=IBM+Plex+Mono:wght@300;400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: ${T.bg};
      color: ${T.text};
      font-family: ${T.fontBody};
    }

    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${T.cyanDim}; border-radius: 3px; }

    input::placeholder, textarea::placeholder {
      color: ${T.textDim} !important;
      font-family: ${T.fontBody};
      font-size: 0.75rem;
      letter-spacing: 0.5px;
    }

    select option {
      background: #020f1e;
      color: ${T.text};
      font-family: ${T.fontBody};
    }

    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button { opacity: 0.3; }

    @keyframes scanline {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100vh); }
    }

    @keyframes pulse-border {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }

    @keyframes data-flicker {
      0%, 95%, 100% { opacity: 1; }
      96% { opacity: 0.7; }
      97% { opacity: 1; }
      98% { opacity: 0.5; }
    }

    @keyframes corner-glow {
      0%, 100% { box-shadow: 0 0 8px ${T.cyanGlow}; }
      50% { box-shadow: 0 0 20px ${T.cyanGlow}, 0 0 40px rgba(0,229,255,0.1); }
    }

    @keyframes enter-up {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes hud-slide {
      from { opacity: 0; transform: translateX(-12px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    @keyframes toast-in {
      from { opacity: 0; transform: translateX(40px) scale(0.95); }
      to   { opacity: 1; transform: translateX(0) scale(1); }
    }

    @keyframes toast-out {
      from { opacity: 1; transform: translateX(0) scale(1); }
      to   { opacity: 0; transform: translateX(40px) scale(0.95); }
    }

    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }

    .field-input {
      transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
    }
    .field-input:focus {
      border-color: ${T.cyan} !important;
      box-shadow: 0 0 0 1px ${T.cyanGlow}, 0 0 20px rgba(0,229,255,0.08), inset 0 0 12px rgba(0,229,255,0.04) !important;
      background: rgba(0,229,255,0.04) !important;
      outline: none;
    }

    .action-btn {
      position: relative;
      overflow: hidden;
      transition: all 0.25s;
    }
    .action-btn::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
      transform: translateX(-100%);
      transition: transform 0.4s;
    }
    .action-btn:hover::before {
      transform: translateX(100%);
    }
  `}</style>
);

/* ─── CORNER DECORATIONS ─────────────────────────────────────────────────── */
function Corners({ color = T.cyan, size = 14, thickness = 2 }) {
  const s = { position: "absolute", width: size, height: size };
  const line = { background: color, position: "absolute", borderRadius: 1 };
  const pos = [
    { top: 0, left: 0, tl: true },
    { top: 0, right: 0, tr: true },
    { bottom: 0, left: 0, bl: true },
    { bottom: 0, right: 0, br: true },
  ];
  return (
    <>
      {pos.map((p, i) => (
        <div key={i} style={{ ...s, ...p }}>
          <div style={{
            ...line,
            width: size, height: thickness,
            top: p.top !== undefined ? 0 : undefined,
            bottom: p.bottom !== undefined ? 0 : undefined,
            left: p.tl || p.bl ? 0 : undefined,
            right: p.tr || p.br ? 0 : undefined,
          }} />
          <div style={{
            ...line,
            width: thickness, height: size,
            top: p.top !== undefined ? 0 : undefined,
            bottom: p.bottom !== undefined ? 0 : undefined,
            left: p.tl || p.bl ? 0 : undefined,
            right: p.tr || p.br ? 0 : undefined,
          }} />
        </div>
      ))}
    </>
  );
}

/* ─── SCAN LINE OVERLAY ──────────────────────────────────────────────────── */
function ScanOverlay() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {/* grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(${T.gridLine} 1px, transparent 1px),
          linear-gradient(90deg, ${T.gridLine} 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }} />
      {/* scan line */}
      <div style={{
        position: "absolute", left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${T.cyan}18, ${T.cyan}30, ${T.cyan}18, transparent)`,
        animation: "scanline 8s linear infinite",
        pointerEvents: "none",
      }} />
      {/* vignette */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(1,6,14,0.7) 100%)",
      }} />
    </div>
  );
}

/* ─── STAT BADGE ─────────────────────────────────────────────────────────── */
function StatBadge({ label, value, color = T.cyan, unit = "" }) {
  return (
    <div style={{
      padding: "10px 14px",
      background: `linear-gradient(135deg, rgba(4,20,35,0.9), rgba(2,12,24,0.95))`,
      border: `1px solid ${color}22`,
      borderRadius: 8,
      position: "relative",
      overflow: "hidden",
      flexShrink: 0,
    }}>
      <Corners color={color} size={8} thickness={1} />
      <div style={{ fontSize: "0.55rem", letterSpacing: "2px", textTransform: "uppercase",
        color: T.textMuted, fontFamily: T.font, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: "1.05rem", fontWeight: 700, color, fontFamily: T.font,
        textShadow: `0 0 12px ${color}` }}>
        {value}<span style={{ fontSize: "0.65rem", marginLeft: 3, opacity: 0.7 }}>{unit}</span>
      </div>
    </div>
  );
}

/* ─── SECTION HEADER ─────────────────────────────────────────────────────── */
function SectionHeader({ children, color = T.cyan }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
      <div style={{ width: 3, height: 16, background: color,
        borderRadius: 2, boxShadow: `0 0 8px ${color}` }} />
      <span style={{
        fontSize: "0.6rem", fontWeight: 700, letterSpacing: "3px",
        textTransform: "uppercase", color, fontFamily: T.font,
        textShadow: `0 0 10px ${color}55`,
      }}>{children}</span>
      <div style={{ flex: 1, height: 1,
        background: `linear-gradient(90deg, ${color}30, transparent)` }} />
    </div>
  );
}

/* ─── LABEL ──────────────────────────────────────────────────────────────── */
function Label({ children, required, color = T.cyan }) {
  return (
    <label style={{
      display: "flex", alignItems: "center", gap: 5,
      fontSize: "0.58rem", fontWeight: 700, letterSpacing: "2.5px",
      textTransform: "uppercase", color: T.textMuted,
      marginBottom: 7, fontFamily: T.font,
    }}>
      <span style={{ width: 4, height: 4, borderRadius: "50%",
        background: color, boxShadow: `0 0 6px ${color}`, flexShrink: 0 }} />
      {children}
      {required && <span style={{ color, marginLeft: 2, fontSize: "0.65rem" }}>*</span>}
    </label>
  );
}

/* ─── FIELD WRAPPER ──────────────────────────────────────────────────────── */
function Field({ label, required, children, color }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <Label required={required} color={color}>{label}</Label>
      {children}
    </div>
  );
}

/* ─── INPUT BASE STYLE ───────────────────────────────────────────────────── */
const inputBase = {
  width: "100%",
  padding: "11px 14px",
  background: "rgba(0,15,30,0.6)",
  border: `1px solid ${T.borderMid}`,
  borderRadius: 8,
  color: T.text,
  fontFamily: T.fontBody,
  fontSize: "0.82rem",
  letterSpacing: "0.3px",
  outline: "none",
  boxSizing: "border-box",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
};

function StyledInput({ name, placeholder, type = "text", value, onChange, required }) {
  return (
    <input className="field-input" type={type} name={name} placeholder={placeholder}
      value={value} onChange={onChange} required={required}
      style={{ ...inputBase }} />
  );
}

function StyledTextarea({ name, placeholder, value, onChange, required, rows = 3 }) {
  return (
    <textarea className="field-input" name={name} placeholder={placeholder}
      value={value} onChange={onChange} required={required} rows={rows}
      style={{ ...inputBase, resize: "vertical", lineHeight: 1.6 }} />
  );
}

function StyledSelect({ name, value, onChange, required, children }) {
  return (
    <div style={{ position: "relative" }}>
      <select className="field-input" name={name} value={value}
        onChange={onChange} required={required}
        style={{
          ...inputBase, appearance: "none", cursor: "pointer",
          paddingRight: 36,
          color: value ? T.text : T.textDim,
        }}>
        {children}
      </select>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke={T.cyan} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </div>
  );
}

/* ─── NEON BUTTON ────────────────────────────────────────────────────────── */
function NeonBtn({ onClick, type = "button", color = T.cyan, icon, children, wide }) {
  const [hov, setHov] = useState(false);
  return (
    <button type={type} onClick={onClick} className="action-btn"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: wide ? "12px 28px" : "10px 20px",
        width: wide ? "100%" : undefined,
        border: `1px solid ${hov ? color : color + "44"}`,
        borderRadius: 8,
        background: hov ? `${color}14` : "rgba(0,8,18,0.7)",
        color: hov ? color : T.textMuted,
        fontFamily: T.font,
        fontSize: "0.72rem",
        fontWeight: 700,
        letterSpacing: "2.5px",
        textTransform: "uppercase",
        cursor: "pointer",
        outline: "none",
        boxShadow: hov ? `0 0 18px ${color}30, inset 0 0 12px ${color}08` : "none",
        textShadow: hov ? `0 0 10px ${color}` : "none",
        transition: "all 0.25s",
      }}>
      {icon}
      {children}
    </button>
  );
}

/* ─── ICONS ──────────────────────────────────────────────────────────────── */
const IconExcel = ({ c }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>
  </svg>
);
const IconWord = ({ c }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="9" y1="13" x2="15" y2="13"/>
  </svg>
);
const IconSave = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
);
const IconRoute = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.cyan} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/>
    <path d="M6 17V11a5 5 0 0 1 5-5h4"/>
    <polyline points="15 3 18 6 15 9"/>
  </svg>
);

/* ─── TOAST ──────────────────────────────────────────────────────────────── */
function Toast({ message, type, onDone }) {
  const [out, setOut] = useState(false);
  const color = type === "success" ? T.green : T.cyan;

  useEffect(() => {
    const t1 = setTimeout(() => setOut(true), 2600);
    const t2 = setTimeout(onDone, 2900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", bottom: 32, right: 32, zIndex: 9999,
      display: "flex", alignItems: "center", gap: 12,
      padding: "14px 20px",
      background: "rgba(2,12,24,0.97)",
      border: `1px solid ${color}50`,
      borderRadius: 10,
      boxShadow: `0 0 30px ${color}20, 0 16px 48px rgba(0,0,0,0.6)`,
      color,
      fontFamily: T.font,
      fontSize: "0.8rem",
      fontWeight: 600,
      letterSpacing: "1.5px",
      animation: out
        ? "toast-out 0.3s ease forwards"
        : "toast-in 0.3s ease forwards",
      textShadow: `0 0 10px ${color}88`,
    }}>
      <div style={{ position: "relative" }}>
        <Corners color={color} size={6} thickness={1} />
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color}
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {type === "success"
          ? <polyline points="20 6 9 17 4 12"/>
          : <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
        }
      </svg>
      {message}
    </div>
  );
}

/* ─── LOGO ───────────────────────────────────────────────────────────────── */
function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      {/* Hex icon */}
      <div style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
        <svg viewBox="0 0 44 44" width="44" height="44">
          <polygon points="22,3 39,12 39,32 22,41 5,32 5,12"
            fill="none" stroke={T.cyan} strokeWidth="1.5"
            style={{ filter: `drop-shadow(0 0 6px ${T.cyan})` }}/>
          <polygon points="22,9 34,16 34,28 22,35 10,28 10,16"
            fill={T.cyanDim} stroke={`${T.cyan}50`} strokeWidth="1"/>
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center" }}>
          <IconRoute />
        </div>
      </div>
      <div>
        <div style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: "1.35rem", fontWeight: 800,
          color: T.cyan,
          textShadow: `0 0 20px ${T.cyan}88, 0 0 40px ${T.cyan}33`,
          letterSpacing: "3px",
          lineHeight: 1,
        }}>
          TRACK<span style={{ color: T.green, textShadow: `0 0 20px ${T.green}88` }}>ROUTES</span>
        </div>
        <div style={{
          fontFamily: T.fontBody, fontSize: "0.6rem", letterSpacing: "3px",
          color: T.textDim, textTransform: "uppercase", marginTop: 3,
          animation: "data-flicker 5s ease infinite",
        }}>
          ◈ GESTION ROUTIÈRE · ADMIN PANEL
        </div>
      </div>
    </div>
  );
}

/* ─── HUD STATUS BAR ─────────────────────────────────────────────────────── */
function HudBar() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const ts = time.toLocaleTimeString("fr-MA", { hour12: false });

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "8px 16px",
      background: "rgba(0,229,255,0.04)",
      border: `1px solid ${T.border}`,
      borderRadius: 8,
      marginBottom: 24,
      fontFamily: T.fontBody,
      fontSize: "0.65rem",
      color: T.textDim,
      letterSpacing: "1px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span>
          <span style={{ color: T.green, marginRight: 5,
            animation: "blink 1.4s step-start infinite" }}>●</span>
          SYSTÈME EN LIGNE
        </span>
        <span style={{ color: T.borderMid }}>|</span>
        <span>SESSION · ACTIF</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ color: T.cyan }}>{ts}</span>
        <span style={{ color: T.borderMid }}>|</span>
        <span>v2.6.1</span>
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────── */
export default function TrackRoutesForm() {
  const [formData, setFormData] = useState({
    nom: "", type: "", objet: "", montant: "", avancement: "",
  });
  const [toast, setToast] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const showToast = (message, type = "success") =>
    setToast({ message, type, key: Date.now() });

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = `TR-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
    try {
      const raw = localStorage.getItem("marches");
      const existing = raw ? JSON.parse(raw) : [];
      const next = [{ id, ...formData, statut: "En cours" }, ...(Array.isArray(existing) ? existing : [])];
      localStorage.setItem("marches", JSON.stringify(next));
    } catch {
      // ignore persistence errors
    }
    showToast("Marché enregistré avec succès");
    setFormData({ nom: "", type: "", objet: "", montant: "", avancement: "" });
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet([formData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Marché");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf], { type: "application/octet-stream" }), "TrackRoutes_Marche.xlsx");
    showToast("Export Excel réussi");
  };

  const exportToWord = () => {
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: "TrackRoutes — Gestion du Marché", heading: HeadingLevel.HEADING_1 }),
          new Paragraph(""),
          ...[ ["Nom du marché", formData.nom], ["Type", formData.type],
               ["Objet", formData.objet],
               ["Montant", formData.montant ? `${Number(formData.montant).toLocaleString("fr-MA")} MAD` : ""],
               ["Avancement", formData.avancement],
          ].map(([l, v]) => new Paragraph({
            children: [new TextRun({ text: `${l} : `, bold: true }), new TextRun(v || "—")],
          })),
        ],
      }],
    });
    Packer.toBlob(doc).then(blob => { saveAs(blob, "TrackRoutes_Marche.docx"); showToast("Export Word réussi"); });
  };

  const montantNum = parseFloat(formData.montant) || 0;

  return (
    <>
      <GlobalStyle />
      <ScanOverlay />

      <div style={{
        minHeight: "100vh",
        background: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,229,255,0.04) 0%, transparent 60%),
                     radial-gradient(ellipse 60% 40% at 80% 100%, rgba(0,255,136,0.03) 0%, transparent 50%),
                     linear-gradient(180deg, ${T.bgDeep} 0%, #010d1e 50%, ${T.bgDeep} 100%)`,
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "40px 16px 60px",
        fontFamily: T.fontBody,
        position: "relative", zIndex: 1,
      }}>
        <div style={{
          width: "100%", maxWidth: 620,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}>

          {/* ── Top bar ── */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 28, flexWrap: "wrap", gap: 16,
          }}>
            <Logo />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <StatBadge label="Marchés actifs" value="12" color={T.cyan} />
              <StatBadge label="Budget total" value="84.2M" color={T.green} unit="MAD" />
            </div>
          </div>

          {/* ── HUD bar ── */}
          <HudBar />

          {/* ── Main card ── */}
          <div style={{
            position: "relative",
            background: `linear-gradient(145deg, rgba(4,20,38,0.9) 0%, rgba(2,12,26,0.95) 100%)`,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: `0 0 0 1px rgba(0,229,255,0.05),
                        0 32px 80px rgba(0,0,0,0.6),
                        inset 0 1px 0 rgba(0,229,255,0.08)`,
            overflow: "hidden",
          }}>
            <Corners color={T.cyan} size={18} thickness={2} />

            {/* top accent line */}
            <div style={{
              height: 2,
              background: `linear-gradient(90deg, transparent, ${T.cyan}60, ${T.green}40, transparent)`,
              marginBottom: 0,
            }} />

            {/* inner panel */}
            <div style={{ padding: "32px 30px" }}>

              <SectionHeader color={T.cyan}>Informations du marché</SectionHeader>

              <form onSubmit={handleSubmit}>

                {/* 2-col row: nom + type */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0 20px",
                }}>
                  <Field label="Nom du marché" required color={T.cyan}>
                    <StyledInput name="nom"
                      placeholder="Ex : Construction RN1 — Lot 3"
                      value={formData.nom} onChange={handleChange} required />
                  </Field>
                  <Field label="Type de marché" required color={T.green}>
                    <StyledSelect name="type" value={formData.type}
                      onChange={handleChange} required>
                      <option value="">— Sélectionner —</option>
                      <option value="Travaux">Travaux</option>
                      <option value="Services">Services</option>
                      <option value="Fournitures">Fournitures</option>
                      <option value="Études">Études &amp; Ingénierie</option>
                    </StyledSelect>
                  </Field>
                </div>

                <Field label="Objet du marché" required color={T.cyan}>
                  <StyledTextarea name="objet"
                    placeholder="Description détaillée de l'objet du marché…"
                    value={formData.objet} onChange={handleChange} required rows={3} />
                </Field>

                {/* montant with inline display */}
                <Field label="Montant (MAD)" required color={T.green}>
                  <div style={{ position: "relative" }}>
                    <StyledInput name="montant" type="number" placeholder="0.00"
                      value={formData.montant} onChange={handleChange} required />
                    <span style={{
                      position: "absolute", right: 14, top: "50%",
                      transform: "translateY(-50%)",
                      fontFamily: T.font, fontSize: "0.65rem", fontWeight: 700,
                      color: T.green, letterSpacing: "2px", pointerEvents: "none",
                      textShadow: `0 0 8px ${T.green}`,
                    }}>MAD</span>
                  </div>
                  {montantNum > 0 && (
                    <div style={{
                      marginTop: 6, fontSize: "0.65rem",
                      color: T.green, fontFamily: T.fontBody, letterSpacing: "0.5px",
                      opacity: 0.7,
                    }}>
                      ◈ {montantNum.toLocaleString("fr-MA", { minimumFractionDigits: 2 })} MAD
                    </div>
                  )}
                </Field>

                <Field label="État d'avancement" required color={T.amber}>
                  <StyledTextarea name="avancement"
                    placeholder="État d'avancement, observations, jalons atteints…"
                    value={formData.avancement} onChange={handleChange} required rows={4} />
                </Field>

                {/* ── divider ── */}
                <div style={{
                  margin: "24px 0 22px",
                  height: 1,
                  background: `linear-gradient(90deg, transparent, ${T.cyan}20, transparent)`,
                }} />

                {/* ── actions ── */}
                <SectionHeader color={T.textDim}>Actions d'export &amp; sauvegarde</SectionHeader>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
                  <NeonBtn onClick={exportToExcel} color={T.green} icon={<IconExcel />}>
                    Excel
                  </NeonBtn>
                  <NeonBtn onClick={exportToWord} color={T.cyan} icon={<IconWord />}>
                    Word
                  </NeonBtn>
                </div>

                <NeonBtn type="submit" color={T.green} icon={<IconSave />} wide>
                  Enregistrer le marché
                </NeonBtn>

              </form>
            </div>

            {/* bottom status strip */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 30px",
              borderTop: `1px solid ${T.border}`,
              background: "rgba(0,0,0,0.25)",
              fontFamily: T.fontBody, fontSize: "0.6rem",
              color: T.textDim, letterSpacing: "1px",
            }}>
              <span>© {new Date().getFullYear()} TrackRoutes · Tous droits réservés</span>
              <span style={{ color: T.cyan + "80" }}>SECURE · ENCRYPTED</span>
            </div>
          </div>

        </div>
      </div>

      {toast && (
        <Toast key={toast.key} message={toast.message} type={toast.type}
          onDone={() => setToast(null)} />
      )}
    </>
  );
}
