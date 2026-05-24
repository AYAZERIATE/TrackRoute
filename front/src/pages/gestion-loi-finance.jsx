import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';

// ─────────────────────────────────────────────────────────────
// DESIGN TOKENS — TrackRoutes Neon Cyber
// ─────────────────────────────────────────────────────────────
const T = {
  bg:           '#020b14',
  bgDeep:       '#010810',
  panel:        'rgba(4, 20, 35, 0.88)',
  panelAlt:     'rgba(2, 12, 26, 0.95)',
  cyan:         '#00e5ff',
  cyanDim:      'rgba(0,229,255,0.10)',
  cyanGlow:     'rgba(0,229,255,0.32)',
  cyanBorder:   'rgba(0,229,255,0.18)',
  cyanBorderMid:'rgba(0,229,255,0.30)',
  green:        '#00ff88',
  greenDim:     'rgba(0,255,136,0.10)',
  greenGlow:    'rgba(0,255,136,0.28)',
  greenBorder:  'rgba(0,255,136,0.22)',
  amber:        '#ffb300',
  amberDim:     'rgba(255,179,0,0.10)',
  amberBorder:  'rgba(255,179,0,0.25)',
  red:          '#ff4466',
  redDim:       'rgba(255,68,102,0.12)',
  redBorder:    'rgba(255,68,102,0.35)',
  text:         '#cce8f4',
  textMuted:    'rgba(140,190,220,0.55)',
  textDim:      'rgba(80,130,160,0.45)',
  gridLine:     'rgba(0,229,255,0.032)',
  font:         "'Rajdhani', 'Orbitron', monospace",
  fontBody:     "'IBM Plex Mono', 'Courier New', monospace",
};

// ─────────────────────────────────────────────────────────────
// FIELD DEFINITIONS
// ─────────────────────────────────────────────────────────────
const FIELDS = [
  { name: 'loiFinance',                   label: 'Loi de Finance',               section: 1, required: true },
  { name: 'numeroDepense',                label: 'Numéro Dépense',               section: 1, required: true },
  { name: 'rubrique',                     label: 'Rubrique',                     section: 1, required: true },
  { name: 'beneficiaire',                 label: 'Bénéficiaire',                 section: 1, required: true },
  { name: 'objet',                        label: 'Objet',                        section: 1, required: true, spanFull: true },
  { name: 'montantGlobal',               label: 'Montant Global (DHS)',          section: 2, required: true, numeric: true },
  { name: 'montantCaution',              label: 'Montant Caution (DHS)',         section: 2, numeric: true },
  { name: 'montantRetenueGarantie',      label: 'Retenue de Garantie (DHS)',     section: 2, numeric: true },
  { name: 'dernierDecompte',             label: 'Dernier Décompte',              section: 2, numeric: true },
  { name: 'cp2026',                      label: 'CP 2026 (DHS)',                 section: 2, numeric: true },
  { name: 'ce2027',                      label: 'CE 2027 (DHS)',                 section: 2, numeric: true },
  { name: 'montantOrdonnance',           label: 'Montant Ordonnancé (DHS)',      section: 3, numeric: true },
  { name: 'resteAOrdonnancer',           label: 'Reste à Ordonnancer (DHS)',     section: 3, calc: true },
  { name: 'tauxEmission',               label: "Taux d'Émission (%)",           section: 3, calc: true },
  { name: 'dateAttribution',             label: "Date d'Attribution",            section: 4, placeholder: 'JJ/MM/AAAA' },
  { name: 'dateVisa',                    label: 'Date de Visa',                  section: 4, placeholder: 'JJ/MM/AAAA' },
  { name: 'dateApprobation',             label: "Date d'Approbation",            section: 4, placeholder: 'JJ/MM/AAAA' },
  { name: 'dateNotificationApprobation', label: 'Date Notif. Approbation',       section: 4, placeholder: 'JJ/MM/AAAA' },
  { name: 'dateCommencement',            label: 'Date de Commencement',          section: 4, placeholder: 'JJ/MM/AAAA' },
  { name: 'datePVRD',                    label: 'Date de la PVRD',               section: 4, placeholder: 'JJ/MM/AAAA' },
  { name: 'dateApprobationDD',           label: "Date d'Approbation DD",         section: 4, placeholder: 'JJ/MM/AAAA' },
  { name: 'dateLiberationCautions',      label: 'Date Libération Cautions',      section: 4, placeholder: 'JJ/MM/AAAA' },
];

const EDITABLE = FIELDS.filter(f => !f.calc);
const EMPTY    = Object.fromEntries(FIELDS.map(f => [f.name, '']));

const parseDate = (v) => {
  if (!v) return null;
  const s = v.trim();
  const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) return new Date(`${dmy[3]}-${dmy[2].padStart(2,'0')}-${dmy[1].padStart(2,'0')}`);
  const iso = s.match(/^\d{4}-\d{2}-\d{2}$/);
  if (iso) return new Date(s);
  return null;
};
const isValidDate = (v) => { const d = parseDate(v); return d && !isNaN(d.getTime()); };

// ─────────────────────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@400;600;700;800;900&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${T.cyanDim}; border-radius: 3px; }
    input::placeholder, textarea::placeholder { color: ${T.textDim} !important; font-family: ${T.fontBody}; font-size: 0.75rem; }
    select option { background: #020f1e; color: ${T.text}; }

    @keyframes scanline {
      0%   { transform: translateY(-100%); }
      100% { transform: translateY(100vh); }
    }
    @keyframes blink {
      0%,100% { opacity:1; } 50% { opacity:0; }
    }
    @keyframes enter-up {
      from { opacity:0; transform:translateY(22px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes toast-in {
      from { opacity:0; transform:translateX(30px) scale(0.95); }
      to   { opacity:1; transform:translateX(0) scale(1); }
    }
    @keyframes toast-out {
      from { opacity:1; transform:translateX(0) scale(1); }
      to   { opacity:0; transform:translateX(30px) scale(0.95); }
    }
    @keyframes pulse-cyan {
      0%,100% { box-shadow: 0 0 0 0 ${T.cyanGlow}; }
      50%      { box-shadow: 0 0 0 6px rgba(0,229,255,0); }
    }
    @keyframes pulse-green {
      0%,100% { box-shadow: 0 0 0 0 ${T.greenGlow}; }
      50%      { box-shadow: 0 0 0 6px rgba(0,255,136,0); }
    }
    @keyframes data-flicker {
      0%,95%,100% { opacity:1; } 96% { opacity:0.6; } 97% { opacity:1; } 98% { opacity:0.4; }
    }

    .cyber-input {
      transition: border-color 0.22s, box-shadow 0.22s, background 0.22s;
    }
    .cyber-input:focus {
      border-color: ${T.cyan} !important;
      box-shadow: 0 0 0 1px ${T.cyanGlow}, 0 0 18px rgba(0,229,255,0.07), inset 0 0 10px rgba(0,229,255,0.03) !important;
      background: rgba(0,229,255,0.035) !important;
      outline: none;
    }
    .cyber-input.calc-field {
      cursor: not-allowed;
      font-style: italic;
    }
    .cyber-input.error-field {
      border-color: ${T.red} !important;
      box-shadow: 0 0 0 1px rgba(255,68,102,0.25) !important;
    }

    .neon-btn {
      position: relative; overflow: hidden;
      transition: all 0.22s;
    }
    .neon-btn::before {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
      transform: translateX(-100%);
      transition: transform 0.38s;
    }
    .neon-btn:hover::before { transform: translateX(100%); }

    .del-btn:hover {
      background: ${T.redDim} !important;
      color: ${T.red} !important;
      border-color: ${T.redBorder} !important;
    }

    tr:hover td { background: rgba(0,229,255,0.025) !important; }
  `}</style>
);

// ─────────────────────────────────────────────────────────────
// SCAN OVERLAY
// ─────────────────────────────────────────────────────────────
function ScanOverlay() {
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
      <div style={{
        position:'absolute', inset:0,
        backgroundImage:`linear-gradient(${T.gridLine} 1px,transparent 1px),linear-gradient(90deg,${T.gridLine} 1px,transparent 1px)`,
        backgroundSize:'44px 44px',
      }}/>
      <div style={{
        position:'absolute', left:0, right:0, height:2,
        background:`linear-gradient(90deg,transparent,${T.cyan}16,${T.cyan}28,${T.cyan}16,transparent)`,
        animation:'scanline 9s linear infinite',
      }}/>
      <div style={{ position:'absolute', inset:0,
        background:'radial-gradient(ellipse at center,transparent 35%,rgba(1,6,14,0.65) 100%)' }}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CORNER DECORATIONS
// ─────────────────────────────────────────────────────────────
function Corners({ color=T.cyan, size=16, thickness=2 }) {
  const corner = (pos) => (
    <div key={JSON.stringify(pos)} style={{ position:'absolute', width:size, height:size, ...pos }}>
      <div style={{ position:'absolute', background:color, borderRadius:1,
        width:size, height:thickness,
        top: pos.top !== undefined ? 0 : undefined,
        bottom: pos.bottom !== undefined ? 0 : undefined,
        left: pos.left !== undefined ? 0 : undefined,
        right: pos.right !== undefined ? 0 : undefined,
      }}/>
      <div style={{ position:'absolute', background:color, borderRadius:1,
        width:thickness, height:size,
        top: pos.top !== undefined ? 0 : undefined,
        bottom: pos.bottom !== undefined ? 0 : undefined,
        left: pos.left !== undefined ? 0 : undefined,
        right: pos.right !== undefined ? 0 : undefined,
      }}/>
    </div>
  );
  return <>
    {corner({ top:0, left:0 })}
    {corner({ top:0, right:0 })}
    {corner({ bottom:0, left:0 })}
    {corner({ bottom:0, right:0 })}
  </>;
}

// ─────────────────────────────────────────────────────────────
// HUD STATUS BAR
// ─────────────────────────────────────────────────────────────
function HudBar({ count }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'8px 16px',
      background:'rgba(0,229,255,0.035)',
      border:`1px solid ${T.cyanBorder}`,
      borderRadius:8, marginBottom:24,
      fontFamily:T.fontBody, fontSize:'0.62rem', color:T.textDim, letterSpacing:'1px',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:16 }}>
        <span>
          <span style={{ color:T.green, marginRight:5, animation:'blink 1.4s step-start infinite' }}>●</span>
          SYSTÈME EN LIGNE
        </span>
        <span style={{ color:T.cyanBorder }}>|</span>
        <span style={{ color:T.textMuted }}>FINANCES PUBLIQUES · MODULE ACTIF</span>
        {count > 0 && <>
          <span style={{ color:T.cyanBorder }}>|</span>
          <span style={{ color:T.green }}>{count} ENTR{count>1?'ÉES':'ÉE'} VALIDÉE{count>1?'S':''}</span>
        </>}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:16 }}>
        <span style={{ color:T.cyan }}>{time.toLocaleTimeString('fr-MA',{hour12:false})}</span>
        <span style={{ color:T.cyanBorder }}>|</span>
        <span>v3.1.0</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LOGO
// ─────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:28 }}>
      <div style={{ position:'relative', width:44, height:44, flexShrink:0 }}>
        <svg viewBox="0 0 44 44" width="44" height="44">
          <polygon points="22,3 39,12 39,32 22,41 5,32 5,12"
            fill="none" stroke={T.cyan} strokeWidth="1.5"
            style={{ filter:`drop-shadow(0 0 6px ${T.cyan})` }}/>
          <polygon points="22,9 34,16 34,28 22,35 10,28 10,16"
            fill={T.cyanDim} stroke={`${T.cyan}44`} strokeWidth="1"/>
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.cyan} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
      </div>
      <div>
        <div style={{
          fontFamily:"'Orbitron', monospace", fontSize:'1.3rem', fontWeight:800,
          color:T.cyan, textShadow:`0 0 18px ${T.cyan}88, 0 0 38px ${T.cyan}33`,
          letterSpacing:'3px', lineHeight:1,
        }}>
          TRACK<span style={{ color:T.green, textShadow:`0 0 18px ${T.green}88` }}>ROUTES</span>
        </div>
        <div style={{
          fontFamily:T.fontBody, fontSize:'0.58rem', letterSpacing:'3px',
          color:T.textDim, textTransform:'uppercase', marginTop:3,
          animation:'data-flicker 5s ease infinite',
        }}>◈ GESTION LOI DE FINANCE · ADMIN PANEL</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SECTION HEADER
// ─────────────────────────────────────────────────────────────
function SectionHeader({ children, color=T.cyan, note }) {
  return (
    <div style={{
      gridColumn:'1/-1', display:'flex', alignItems:'center', gap:10,
      marginBottom:4, marginTop:4, paddingBottom:8,
      borderBottom:`1px solid ${color}22`,
    }}>
      <div style={{ width:3, height:14, background:color, borderRadius:2, boxShadow:`0 0 8px ${color}`, flexShrink:0 }}/>
      <span style={{
        fontFamily:T.font, fontSize:'0.62rem', fontWeight:700, letterSpacing:'3px',
        textTransform:'uppercase', color, textShadow:`0 0 10px ${color}55`,
      }}>{children}</span>
      {note && <span style={{ fontFamily:T.fontBody, color:T.textDim, fontSize:'0.58rem', letterSpacing:'1px' }}>{note}</span>}
      <div style={{ flex:1, height:1, background:`linear-gradient(90deg,${color}28,transparent)` }}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CYBER PANEL
// ─────────────────────────────────────────────────────────────
function CyberPanel({ children, style={}, cornerColor=T.cyan }) {
  return (
    <div style={{
      position:'relative',
      background:`linear-gradient(145deg,rgba(4,20,38,0.92),rgba(2,12,26,0.97))`,
      border:`1px solid ${T.cyanBorder}`,
      borderRadius:14,
      backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)',
      boxShadow:`0 0 0 1px rgba(0,229,255,0.04), 0 28px 72px rgba(0,0,0,0.58), inset 0 1px 0 rgba(0,229,255,0.07)`,
      overflow:'hidden',
      ...style,
    }}>
      <Corners color={cornerColor} size={16} thickness={2}/>
      <div style={{
        height:2,
        background:`linear-gradient(90deg,transparent,${T.cyan}55,${T.green}35,transparent)`,
      }}/>
      <div style={{ padding:'28px 28px 26px' }}>
        {children}
      </div>
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'8px 28px',
        borderTop:`1px solid ${T.cyanBorder}`,
        background:'rgba(0,0,0,0.22)',
        fontFamily:T.fontBody, fontSize:'0.58rem', color:T.textDim, letterSpacing:'1px',
      }}>
        <span>© {new Date().getFullYear()} TrackRoutes</span>
        <span style={{ color:`${T.cyan}66` }}>SECURE · ENCRYPTED</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FIELD INPUT
// ─────────────────────────────────────────────────────────────
function FieldInput({ fieldDef, value, onChange, error, isActive, setActiveIdx, inputRef }) {
  const { name, label, required, calc, spanFull, placeholder, numeric } = fieldDef;
  const [hov, setHov] = useState(false);

  const accentColor = calc ? T.amber : numeric ? T.green : T.cyan;

  return (
    <div style={{
      display:'flex', flexDirection:'column', gap:6,
      ...(spanFull ? { gridColumn:'1/-1' } : {}),
    }}>
      {/* label row */}
      <div style={{ display:'flex', alignItems:'center', gap:5 }}>
        <span style={{
          width:4, height:4, borderRadius:'50%', flexShrink:0,
          background: accentColor,
          boxShadow:`0 0 6px ${accentColor}`,
        }}/>
        <label style={{
          fontFamily:T.font, fontSize:'0.6rem', fontWeight:700, letterSpacing:'2.2px',
          textTransform:'uppercase',
          color: isActive && !calc ? T.cyan : hov && !calc ? T.textMuted : T.textDim,
          transition:'color 0.2s',
          cursor: calc ? 'not-allowed' : 'default',
        }}>
          {label}
          {required && <span style={{ color:T.cyan, marginLeft:3 }}>*</span>}
          {calc && <span style={{ color:T.textDim, fontSize:'0.55rem', marginLeft:5 }}>(auto)</span>}
        </label>
        {isActive && !calc && (
          <span style={{
            fontFamily:T.fontBody, fontSize:'0.52rem', letterSpacing:'1px',
            background:T.cyanDim, border:`1px solid ${T.cyanBorderMid}`,
            color:T.cyan, borderRadius:4, padding:'1px 6px',
          }}>actif</span>
        )}
      </div>
      {/* input */}
      <input
        ref={calc ? undefined : inputRef}
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        readOnly={calc}
        placeholder={calc ? 'Calculé automatiquement' : (placeholder || '')}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        onFocus={() => {
          if (!calc) {
            const idx = EDITABLE.findIndex(f => f.name === name);
            if (idx !== -1) setActiveIdx(idx);
          }
        }}
        className={`cyber-input${calc?' calc-field':''}${error?' error-field':''}`}
        style={{
          width:'100%', padding:'10px 13px',
          background: calc ? 'rgba(255,179,0,0.05)' : 'rgba(0,10,22,0.65)',
          border:`1px solid ${
            error ? T.red :
            calc  ? T.amberBorder :
            hov && !calc ? T.cyanBorderMid : T.cyanBorder
          }`,
          borderRadius:8,
          color: calc ? T.amber : T.text,
          fontFamily:T.fontBody, fontSize:'0.8rem', letterSpacing:'0.3px',
          outline:'none',
        }}
      />
      {error && (
        <span style={{ fontFamily:T.fontBody, color:T.red, fontSize:'0.62rem', letterSpacing:'0.5px' }}>
          ⚠ {error}
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// NEON BUTTON
// ─────────────────────────────────────────────────────────────
function NeonBtn({ onClick, type='button', color=T.cyan, children, disabled, pulse, icon, wide, size='md' }) {
  const [hov, setHov] = useState(false);
  const pad = size === 'lg' ? '14px 28px' : size === 'sm' ? '7px 14px' : '10px 20px';
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => !disabled && setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="neon-btn"
      style={{
        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        padding:pad,
        width: wide ? '100%' : undefined,
        border:`1px solid ${disabled ? color+'33' : hov ? color : color+'44'}`,
        borderRadius:9,
        background: disabled ? 'rgba(0,8,18,0.4)' : hov ? `${color}14` : 'rgba(0,8,18,0.7)',
        color: disabled ? color+'44' : hov ? color : T.textMuted,
        fontFamily:T.font, fontSize: size==='lg'?'0.9rem':'0.72rem',
        fontWeight:700, letterSpacing:'2px', textTransform:'uppercase',
        cursor: disabled ? 'not-allowed' : 'pointer',
        outline:'none',
        boxShadow: disabled ? 'none' : hov ? `0 0 18px ${color}28, inset 0 0 10px ${color}06` : 'none',
        textShadow: hov && !disabled ? `0 0 10px ${color}` : 'none',
        transform: hov && !disabled ? 'translateY(-2px)' : 'translateY(0)',
        animation: pulse && !disabled ? `${color===T.green?'pulse-green':'pulse-cyan'} 2.4s infinite` : 'none',
        transition:'all 0.22s',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {icon && <span style={{ fontSize:'1.1em' }}>{icon}</span>}
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────────────
function Toast({ message, type, onDone }) {
  const [out, setOut] = useState(false);
  const color = type === 'success' ? T.green : type === 'error' ? T.red : T.cyan;
  useEffect(() => {
    const t1 = setTimeout(() => setOut(true), 3000);
    const t2 = setTimeout(onDone, 3300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);
  return (
    <div style={{
      position:'fixed', bottom:32, right:32, zIndex:9999,
      display:'flex', alignItems:'center', gap:12,
      padding:'13px 20px',
      background:'rgba(2,10,22,0.97)',
      border:`1px solid ${color}44`,
      borderRadius:10,
      boxShadow:`0 0 28px ${color}18, 0 16px 48px rgba(0,0,0,0.6)`,
      color, fontFamily:T.font, fontSize:'0.78rem', fontWeight:600, letterSpacing:'1.5px',
      textShadow:`0 0 10px ${color}66`,
      animation: out ? 'toast-out 0.28s ease forwards' : 'toast-in 0.28s ease forwards',
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {type === 'success'
          ? <polyline points="20 6 9 17 4 12"/>
          : type === 'error'
          ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
          : <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
        }
      </svg>
      {message}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STAT BADGE
// ─────────────────────────────────────────────────────────────
function StatBadge({ label, value, color=T.cyan, unit='' }) {
  return (
    <div style={{
      padding:'9px 14px',
      background:`linear-gradient(135deg,rgba(4,20,35,0.92),rgba(2,12,24,0.97))`,
      border:`1px solid ${color}22`, borderRadius:8, position:'relative', flexShrink:0,
    }}>
      <Corners color={color} size={7} thickness={1}/>
      <div style={{ fontFamily:T.font, fontSize:'0.52rem', letterSpacing:'2px', textTransform:'uppercase', color:T.textDim, marginBottom:2 }}>{label}</div>
      <div style={{ fontFamily:T.font, fontSize:'1rem', fontWeight:700, color, textShadow:`0 0 12px ${color}` }}>
        {value}<span style={{ fontSize:'0.6rem', marginLeft:3, opacity:0.7 }}>{unit}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
const GestionLoiFinance = () => {
  const [formData,  setFormData]  = useState({ ...EMPTY });
  const [entries,   setEntries]   = useState([]);
  const [errors,    setErrors]    = useState({});
  const [toasts,    setToasts]    = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [mounted,   setMounted]   = useState(false);

  const inputEls = useRef({});
  const setRef = useCallback((name) => (node) => { if (node) inputEls.current[name] = node; }, []);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  const focusAt = useCallback((idx) => {
    const clamped = Math.max(0, Math.min(idx, EDITABLE.length - 1));
    setActiveIdx(clamped);
    const el = inputEls.current[EDITABLE[clamped].name];
    if (el && document.activeElement !== el) {
      el.focus();
      try {
        const len = el.value.length;
        el.setSelectionRange(len, len);
      } catch {
        // ignore selection errors (e.g. unsupported input types)
      }
    }
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const active = document.activeElement;
      const tag = active?.tagName ?? '';
      if (e.key === 'Tab') {
        const isOurs = tag === 'INPUT' && Object.values(inputEls.current).includes(active);
        if (!isOurs && tag !== 'BODY' && tag !== 'DIV') return;
        e.preventDefault();
        const next = e.shiftKey ? activeIdx - 1 : activeIdx + 1;
        focusAt(next < 0 ? EDITABLE.length - 1 : next >= EDITABLE.length ? 0 : next);
        return;
      }
      if (e.key === 'Enter') {
        if (tag === 'INPUT' || tag === 'BODY') document.querySelector('button[type="submit"]')?.click();
        return;
      }
      if (e.key === 'Escape') { active?.blur?.(); return; }
      const boring = ['Shift','Control','Alt','Meta','CapsLock','Dead','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home','End','PageUp','PageDown','Insert','Delete','ScrollLock','Pause','NumLock','ContextMenu'];
      if (boring.includes(e.key)) return;
      const isOurs = tag === 'INPUT' && Object.values(inputEls.current).includes(active);
      if (!isOurs) {
        e.preventDefault();
        focusAt(activeIdx);
        const el = inputEls.current[EDITABLE[activeIdx].name];
        if (el && e.key.length === 1) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
          setter.call(el, el.value + e.key);
          el.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [activeIdx, focusAt]);

  const derived = useMemo(() => {
    const g = parseFloat(formData.montantGlobal) || 0;
    const o = parseFloat(formData.montantOrdonnance) || 0;
    return {
      resteAOrdonnancer: (g - o).toFixed(2),
      tauxEmission: g > 0 ? ((o / g) * 100).toFixed(2) : "0.00",
    };
  }, [formData.montantGlobal, formData.montantOrdonnance]);

  const toastIdRef = useRef(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const showToast = (message, type = 'success') => {
    const id = toastIdRef.current++;
    setToasts(prev => [...prev, { id, message, type }]);
  };
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const validateForm = () => {
    const e = {};
    FIELDS.forEach(f => {
      if (f.calc) return;
      const v = formData[f.name];
      if (f.required && !v?.trim()) { e[f.name] = 'Ce champ est requis.'; return; }
      if (f.numeric && v && (isNaN(v) || parseFloat(v) < 0)) e[f.name] = 'Valeur numérique invalide (≥ 0).';
      if (f.placeholder === 'JJ/MM/AAAA' && v && !isValidDate(v)) e[f.name] = 'Date invalide (JJ/MM/AAAA).';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleValider = (ev) => {
    if (ev) ev.preventDefault();
    if (validateForm()) {
      setEntries(prev => [...prev, { ...formData, ...derived, _id: toastIdRef.current++ }]);
      showToast(`✓ Entrée #${entries.length + 1} validée et ajoutée au tableau !`, 'success');
      setFormData({ ...EMPTY });
      setErrors({});
      setTimeout(() => focusAt(0), 50);
    } else {
      showToast('⚠ Corrigez les erreurs avant de valider.', 'error');
    }
  };

  const handleExport = () => {
    if (!entries.length) { showToast("⚠ Aucune entrée. Validez d'abord des données.", 'error'); return; }
    const labelMap = Object.fromEntries(FIELDS.map(f => [f.name, f.label]));
    const rows = entries.map((r, i) => {
      const row = { '#': i + 1 };
      FIELDS.forEach(f => { row[labelMap[f.name]] = r[f.name] ?? ''; });
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = Object.keys(rows[0]).map(h => ({ wch: Math.max(h.length + 4, 18) }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Loi de Finance');
    XLSX.writeFile(wb, 'loi_finance_export.xlsx');
    showToast(`✓ ${entries.length} ligne(s) exportée(s) → loi_finance_export.xlsx`, 'success');
  };

  const handleReset = () => {
    setFormData({ ...EMPTY });
    setErrors({});
    showToast('Formulaire réinitialisé.', 'info');
    setTimeout(() => focusAt(0), 50);
  };

  const handleDelete = (id) => {
    setEntries(prev => prev.filter(e => e._id !== id));
    showToast('Entrée supprimée.', 'info');
  };

  const bySection = (n) => FIELDS.filter(f => f.section === n);

  const sectionGrids = { 1: 'repeat(2,1fr)', 2: 'repeat(3,1fr)', 3: 'repeat(3,1fr)', 4: 'repeat(4,1fr)' };
  const sectionColors = { 1: T.cyan, 2: T.green, 3: T.amber, 4: T.cyan };
  const sectionTitles = {
    1: '1. Identification',
    2: '2. Informations Financières',
    3: '3. Calculs & Émissions',
    4: '4. Dates',
  };

  const totalGlobal = entries.reduce((s, r) => s + (parseFloat(r.montantGlobal) || 0), 0);
  const totalOrd    = entries.reduce((s, r) => s + (parseFloat(r.montantOrdonnance) || 0), 0);

  const TH_COLS = ['#', ...FIELDS.map(f => f.label), 'Action'];

  // ─── RENDER ──────────────────────────────────────────────
  return (
    <>
      <GlobalStyle/>
      <ScanOverlay/>

      <div style={{
        minHeight:'100vh',
        background:`
          radial-gradient(ellipse 80% 50% at 50% 0%,rgba(0,229,255,0.04) 0%,transparent 60%),
          radial-gradient(ellipse 60% 40% at 80% 100%,rgba(0,255,136,0.03) 0%,transparent 50%),
          linear-gradient(180deg,${T.bgDeep} 0%,#010d1e 50%,${T.bgDeep} 100%)
        `,
        padding:'40px 20px 80px',
        position:'relative', zIndex:1,
        fontFamily:T.fontBody,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        transition:'opacity 0.55s ease, transform 0.55s ease',
      }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>

          {/* ── Header ── */}
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:20, marginBottom:8 }}>
            <Logo/>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              <StatBadge label="Entrées validées" value={entries.length} color={T.cyan}/>
              <StatBadge label="Total global" value={totalGlobal > 0 ? (totalGlobal/1e6).toFixed(2) : '0'} color={T.green} unit="M DHS"/>
              <StatBadge label="Total ordonnancé" value={totalOrd > 0 ? (totalOrd/1e6).toFixed(2) : '0'} color={T.amber} unit="M DHS"/>
            </div>
          </div>

          {/* ── HUD bar ── */}
          <HudBar count={entries.length}/>

          {/* ── Keyboard hint ── */}
          <div style={{
            display:'flex', alignItems:'center', gap:14, flexWrap:'wrap',
            marginBottom:22, padding:'8px 16px',
            background:'rgba(0,229,255,0.03)', border:`1px solid ${T.cyanBorder}`,
            borderRadius:8,
          }}>
            <span style={{ fontFamily:T.font, fontSize:'0.58rem', letterSpacing:'2px', color:T.textDim, textTransform:'uppercase' }}>Raccourcis clavier</span>
            {[['⌨ Taper','focus auto'],['Tab →','suivant'],['⇧ Tab','précédent'],['Enter','valider']].map(([k, v]) => (
              <span key={k} style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:'0.62rem', color:T.textDim, fontFamily:T.fontBody }}>
                <kbd style={{
                  background:T.cyanDim, border:`1px solid ${T.cyanBorderMid}`,
                  borderRadius:4, padding:'1px 7px', color:T.cyan,
                  fontFamily:T.fontBody, fontSize:'0.6rem',
                }}>{k}</kbd>
                <span>{v}</span>
              </span>
            ))}
          </div>

          {/* ═══════════ FORM CARD ═══════════ */}
          <form onSubmit={handleValider} noValidate>
            <CyberPanel style={{ marginBottom:24 }}>

              {[1,2,3,4].map((sec, si) => (
                <React.Fragment key={sec}>
                  {si > 0 && (
                    <div style={{
                      margin:'24px 0',
                      height:1,
                      background:`linear-gradient(90deg,transparent,${T.cyanBorder},transparent)`,
                    }}/>
                  )}
                  <div style={{
                    display:'grid',
                    gridTemplateColumns: sectionGrids[sec],
                    gap:'18px 22px',
                  }}>
                    <SectionHeader
                      color={sectionColors[sec]}
                      note={sec===4 ? '(format JJ/MM/AAAA)' : undefined}
                    >
                      {sectionTitles[sec]}
                    </SectionHeader>
                    {bySection(sec).map(f => (
                      <FieldInput
                        key={f.name}
                        fieldDef={f}
                        value={f.calc ? derived[f.name] : formData[f.name]}
                        onChange={handleChange}
                        error={errors[f.name]}
                        isActive={!f.calc && EDITABLE.findIndex(e => e.name === f.name) === activeIdx}
                        setActiveIdx={setActiveIdx}
                        inputRef={f.calc ? undefined : setRef(f.name)}
                      />
                    ))}
                  </div>
                </React.Fragment>
              ))}

              {/* ── Buttons ── */}
              <div style={{
                margin:'28px 0 0',
                height:1,
                background:`linear-gradient(90deg,transparent,${T.cyanBorder},transparent)`,
              }}/>
              <div style={{ display:'flex', gap:12, marginTop:24, flexWrap:'wrap', alignItems:'stretch' }}>

                <NeonBtn onClick={handleReset} color={T.textMuted} icon="↺">
                  Réinitialiser
                </NeonBtn>

                <NeonBtn
                  type="submit"
                  color={T.cyan}
                  icon="✔"
                  size="lg"
                  pulse
                  wide={false}
                  style={{ flex:1 }}
                >
                  <span>
                    VALIDER L'ENTRÉE
                    <span style={{ display:'block', fontSize:'0.58rem', fontWeight:400, letterSpacing:'1px', opacity:0.7, textTransform:'none', marginTop:1 }}>
                      {entries.length} enregistrée{entries.length!==1?'s':''}
                    </span>
                  </span>
                </NeonBtn>

                <div style={{ flex:1, display:'flex' }}>
                  <NeonBtn
                    onClick={handleExport}
                    color={T.green}
                    icon="⬇"
                    size="lg"
                    pulse={entries.length > 0}
                    disabled={entries.length === 0}
                    wide
                  >
                    <span>
                      EXPORTER VERS EXCEL
                      <span style={{ display:'block', fontSize:'0.58rem', fontWeight:400, letterSpacing:'1px', opacity:0.75, textTransform:'none', marginTop:1 }}>
                        {entries.length === 0 ? "Validez d'abord une entrée" : `${entries.length} ligne${entries.length!==1?'s':''} → .xlsx`}
                      </span>
                    </span>
                  </NeonBtn>
                </div>

              </div>
            </CyberPanel>
          </form>

          {/* ═══════════ TABLE ═══════════ */}
          {entries.length > 0 ? (
            <CyberPanel cornerColor={T.green}>
              {/* table header */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:3, height:14, background:T.green, borderRadius:2, boxShadow:`0 0 8px ${T.green}` }}/>
                  <span style={{ fontFamily:T.font, fontSize:'0.62rem', fontWeight:700, letterSpacing:'3px', textTransform:'uppercase', color:T.green }}>
                    Tableau des Entrées Validées
                  </span>
                  <span style={{
                    background:`linear-gradient(135deg,rgba(0,40,20,0.8),rgba(0,80,40,0.6))`,
                    border:`1px solid ${T.greenBorder}`,
                    color:T.green, borderRadius:20,
                    fontFamily:T.fontBody, fontSize:'0.68rem', fontWeight:700,
                    padding:'2px 12px',
                    boxShadow:`0 2px 8px ${T.greenGlow}`,
                  }}>
                    {entries.length} ligne{entries.length!==1?'s':''}
                  </span>
                </div>
                <NeonBtn onClick={handleExport} color={T.green} icon="⬇" size="sm">
                  Exporter tout
                </NeonBtn>
              </div>

              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'separate', borderSpacing:0, fontSize:'0.7rem', minWidth:1900 }}>
                  <thead>
                    <tr>
                      {TH_COLS.map(h => (
                        <th key={h} style={{
                          background:'rgba(0,229,255,0.06)',
                          color:T.cyan,
                          fontFamily:T.font, fontSize:'0.58rem', fontWeight:700,
                          letterSpacing:'1.5px', textTransform:'uppercase',
                          padding:'10px 12px', textAlign:'left',
                          borderBottom:`2px solid ${T.cyanBorder}`,
                          whiteSpace:'nowrap',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((row, i) => (
                      <tr key={row._id}>
                        <td style={{
                          color:T.cyan, fontWeight:700, fontFamily:T.fontBody,
                          padding:'9px 12px', borderBottom:`1px solid rgba(0,229,255,0.06)`,
                          background: i%2===1 ? 'rgba(0,229,255,0.02)' : 'transparent',
                        }}>{i+1}</td>
                        {FIELDS.map(f => (
                          <td key={f.name} style={{
                            color: f.calc ? T.amber : T.text,
                            fontStyle: f.calc ? 'italic' : 'normal',
                            fontFamily:T.fontBody,
                            padding:'9px 12px',
                            borderBottom:`1px solid rgba(0,229,255,0.055)`,
                            whiteSpace:'nowrap',
                            background: i%2===1 ? 'rgba(0,229,255,0.02)' : 'transparent',
                          }}>
                            {(row[f.name]!==''&&row[f.name]!=null)
                              ? row[f.name]
                              : <span style={{ color:T.textDim }}>—</span>
                            }
                          </td>
                        ))}
                        <td style={{
                          padding:'9px 12px',
                          borderBottom:`1px solid rgba(0,229,255,0.055)`,
                          background: i%2===1 ? 'rgba(0,229,255,0.02)' : 'transparent',
                        }}>
                          <button
                            type="button"
                            className="del-btn"
                            onClick={() => handleDelete(row._id)}
                            style={{
                              background:T.redDim, border:`1px solid ${T.redBorder}`,
                              borderRadius:6, color:T.red,
                              fontFamily:T.font, fontSize:'0.65rem', fontWeight:700, letterSpacing:'1px',
                              padding:'4px 11px', cursor:'pointer', whiteSpace:'nowrap',
                              transition:'all 0.18s',
                            }}
                          >✕ Supprimer</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* totals */}
              <div style={{
                display:'flex', justifyContent:'flex-end', gap:32, marginTop:16,
                flexWrap:'wrap', paddingTop:14,
                borderTop:`1px solid rgba(0,229,255,0.08)`,
              }}>
                {[
                  ['Total Montant Global', totalGlobal, T.green],
                  ['Total Ordonnancé', totalOrd, T.cyan],
                ].map(([label, val, color]) => (
                  <div key={label} style={{ fontFamily:T.fontBody, fontSize:'0.7rem', color:T.textMuted }}>
                    {label} :{' '}
                    <strong style={{ color, fontFamily:T.font, fontSize:'0.8rem', letterSpacing:'0.5px',
                      textShadow:`0 0 8px ${color}` }}>
                      {val.toLocaleString('fr-FR',{minimumFractionDigits:2})} DHS
                    </strong>
                  </div>
                ))}
              </div>
            </CyberPanel>
          ) : (
            <div style={{
              textAlign:'center', padding:'28px 20px',
              border:`1px dashed ${T.cyanBorder}`,
              borderRadius:14, position:'relative',
              background:'rgba(0,229,255,0.015)',
            }}>
              <Corners color={T.cyanBorder} size={12} thickness={1}/>
              <p style={{ fontFamily:T.fontBody, color:T.textDim, fontSize:'0.78rem', letterSpacing:'0.5px' }}>
                ↑ Remplissez le formulaire et cliquez sur{' '}
                <strong style={{ color:T.cyan, fontFamily:T.font, letterSpacing:'1px' }}>VALIDER L'ENTRÉE</strong>{' '}
                pour ajouter des lignes au tableau.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* ── Toasts ── */}
      <div style={{ position:'fixed', bottom:32, right:32, zIndex:9999, display:'flex', flexDirection:'column', gap:10 }}>
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type} onDone={() => removeToast(t.id)}/>
        ))}
      </div>
    </>
  );
};

export default GestionLoiFinance;
