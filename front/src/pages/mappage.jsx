/**
 * MapPage.jsx
 * Standalone route component: /map
 * Dependencies: react-leaflet, leaflet
 * Install: npm install react-leaflet leaflet
 */

import { useState, useRef, useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const PROJECTS = [
  { id: 1,  name: "Marché M-2025-001", lat: 34.0209, lng: -6.8416,  status: "En cours",    budget: 12_000_000, region: "Rabat",        type: "Infrastructure" },
  { id: 2,  name: "Marché M-2025-002", lat: 33.5731, lng: -7.5898,  status: "Clôturé",     budget:  8_500_000, region: "Casablanca",   type: "Bâtiment" },
  { id: 3,  name: "Marché M-2025-003", lat: 34.0479, lng: -5.0003,  status: "Attribution", budget:  5_200_000, region: "Fès",          type: "Voirie" },
  { id: 4,  name: "Marché M-2025-004", lat: 35.7595, lng: -5.8340,  status: "Visé",        budget: 22_000_000, region: "Tanger",       type: "Infrastructure" },
  { id: 5,  name: "Marché M-2025-005", lat: 31.6295, lng: -7.9811,  status: "En cours",    budget: 17_300_000, region: "Marrakech",    type: "Hydraulique" },
  { id: 6,  name: "Marché M-2025-006", lat: 30.4278, lng: -9.5981,  status: "Visé",        budget:  3_800_000, region: "Agadir",       type: "Bâtiment" },
  { id: 7,  name: "Marché M-2025-007", lat: 34.6814, lng: -1.9086,  status: "En cours",    budget:  9_100_000, region: "Oujda",        type: "Voirie" },
  { id: 8,  name: "Marché M-2025-008", lat: 35.1688, lng: -2.9335,  status: "Clôturé",     budget:  4_600_000, region: "Nador",        type: "Infrastructure" },
  { id: 9,  name: "Marché M-2025-009", lat: 32.3372, lng: -6.3498,  status: "Attribution", budget: 11_500_000, region: "Beni Mellal",  type: "Hydraulique" },
  { id: 10, name: "Marché M-2025-010", lat: 33.9989, lng: -4.9770,  status: "En cours",    budget:  7_750_000, region: "Meknès",       type: "Bâtiment" },
  { id: 11, name: "Marché M-2025-011", lat: 35.5665, lng: -5.3706,  status: "Visé",        budget: 14_200_000, region: "Tétouan",      type: "Infrastructure" },
  { id: 12, name: "Marché M-2025-012", lat: 34.2636, lng: -3.9264,  status: "Clôturé",     budget:  6_300_000, region: "Taza",         type: "Voirie" },
];

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
const STATUS = {
  "En cours":    { color: "#00ff88", glow: "rgba(0,255,136,0.5)",  hex: "#00ff88", label: "En cours" },
  "Clôturé":    { color: "#6b7280", glow: "rgba(107,114,128,0.4)", hex: "#6b7280", label: "Clôturé" },
  "Attribution": { color: "#fbbf24", glow: "rgba(251,191,36,0.5)",  hex: "#fbbf24", label: "Attribution" },
  "Visé":        { color: "#38bdf8", glow: "rgba(56,189,248,0.5)",  hex: "#38bdf8", label: "Visé" },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD", maximumFractionDigits: 0 }).format(n);

function createMarkerIcon(status, active = false) {
  const cfg = STATUS[status];
  const size = active ? 22 : 16;
  const ring = active ? 8 : 5;
  const svg = `
    <svg width="${size + ring * 2}" height="${size + ring * 2}" viewBox="0 0 ${size + ring * 2} ${size + ring * 2}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${(size + ring * 2) / 2}" cy="${(size + ring * 2) / 2}" r="${size / 2 + ring - 1}"
        fill="none" stroke="${cfg.color}" stroke-width="1.5" opacity="0.35"/>
      <circle cx="${(size + ring * 2) / 2}" cy="${(size + ring * 2) / 2}" r="${size / 2}"
        fill="${cfg.color}" filter="url(#g)"/>
      <defs>
        <filter id="g" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="${active ? 3 : 2}" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [size + ring * 2, size + ring * 2],
    iconAnchor: [(size + ring * 2) / 2, (size + ring * 2) / 2],
    popupAnchor: [0, -size / 2 - ring],
  });
}

// ─── FLY TO HELPER (child component) ─────────────────────────────────────────
function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 12, { duration: 1.2 });
  }, [target, map]);
  return null;
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function MapPage() {
  const [search, setSearch]         = useState("");
  const [selected, setSelected]     = useState(null);
  const [hovered, setHovered]       = useState(null);
  const [filterStatus, setFilter]   = useState("Tous");
  const markerRefs                  = useRef({});

  const filtered = useMemo(() => {
    return PROJECTS.filter((p) => {
      const matchName   = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.region.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "Tous" || p.status === filterStatus;
      return matchName && matchStatus;
    });
  }, [search, filterStatus]);

  const stats = useMemo(() => ({
    total:  PROJECTS.length,
    active: PROJECTS.filter((p) => p.status === "En cours").length,
    closed: PROJECTS.filter((p) => p.status === "Clôturé").length,
    budget: PROJECTS.reduce((a, p) => a + p.budget, 0),
  }), []);

  function selectProject(proj) {
    setSelected(proj);
    const ref = markerRefs.current[proj.id];
    if (ref) setTimeout(() => ref.openPopup(), 800);
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="mp-root">
        {/* ── SIDEBAR ── */}
        <aside className="mp-sidebar">
          <div className="mp-logo">
            <span className="mp-logo-icon">⬡</span>
            <div>
              <div className="mp-logo-title">GeoTrack</div>
              <div className="mp-logo-sub">Suivi des Marchés Publics</div>
            </div>
          </div>

          {/* Search */}
          <div className="mp-search-wrap">
            <span className="mp-search-icon">⌕</span>
            <input
              className="mp-search"
              placeholder="Rechercher un marché…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="mp-search-clear" onClick={() => setSearch("")}>✕</button>
            )}
          </div>

          {/* Status filter pills */}
          <div className="mp-filters">
            {["Tous", "En cours", "Visé", "Attribution", "Clôturé"].map((s) => (
              <button
                key={s}
                className={`mp-pill ${filterStatus === s ? "mp-pill--active" : ""}`}
                style={filterStatus === s && s !== "Tous"
                  ? { borderColor: STATUS[s]?.color, color: STATUS[s]?.color, boxShadow: `0 0 8px ${STATUS[s]?.glow}` }
                  : {}}
                onClick={() => setFilter(s)}
              >
                {s !== "Tous" && <span className="mp-dot" style={{ background: STATUS[s]?.color }} />}
                {s}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="mp-stats">
            <div className="mp-stat">
              <span className="mp-stat-val">{stats.total}</span>
              <span className="mp-stat-label">Total</span>
            </div>
            <div className="mp-stat">
              <span className="mp-stat-val" style={{ color: "#00ff88" }}>{stats.active}</span>
              <span className="mp-stat-label">En cours</span>
            </div>
            <div className="mp-stat">
              <span className="mp-stat-val" style={{ color: "#6b7280" }}>{stats.closed}</span>
              <span className="mp-stat-label">Clôturés</span>
            </div>
          </div>

          {/* Project list */}
          <div className="mp-list-header">
            <span>{filtered.length} marché{filtered.length !== 1 ? "s" : ""}</span>
          </div>
          <ul className="mp-list">
            {filtered.length === 0 && (
              <li className="mp-empty">Aucun résultat</li>
            )}
            {filtered.map((proj) => {
              const cfg = STATUS[proj.status];
              const isActive = selected?.id === proj.id;
              const isHover = hovered === proj.id;
              return (
                <li
                  key={proj.id}
                  className={`mp-item ${isActive ? "mp-item--active" : ""}`}
                  style={
                    isActive
                      ? { borderLeftColor: cfg.color, background: `${cfg.color}12` }
                      : isHover
                      ? { background: "rgba(148, 163, 184, 0.06)" }
                      : {}
                  }
                  onClick={() => selectProject(proj)}
                  onMouseEnter={() => setHovered(proj.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div className="mp-item-row">
                    <span className="mp-item-dot" style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.glow}` }} />
                    <span className="mp-item-name">{proj.name}</span>
                  </div>
                  <div className="mp-item-meta">
                    <span className="mp-item-region">{proj.region}</span>
                    <span className="mp-item-budget">{fmt(proj.budget)}</span>
                  </div>
                  <span
                    className="mp-item-badge"
                    style={{ color: cfg.color, borderColor: `${cfg.color}55`, background: `${cfg.color}15` }}
                  >
                    {proj.status}
                  </span>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* ── MAP AREA ── */}
        <main className="mp-map-wrap">
          {/* Top bar */}
          <div className="mp-topbar">
            <div className="mp-topbar-left">
              <span className="mp-topbar-pulse" />
              <span className="mp-topbar-live">LIVE</span>
              <span className="mp-topbar-label">Tableau de bord géospatial — Maroc</span>
            </div>
            <div className="mp-topbar-right">
              <span className="mp-topbar-budget">Budget total : {fmt(stats.budget)}</span>
            </div>
          </div>

          <MapContainer
            center={[31.7917, -7.0926]}
            zoom={6}
            className="mp-leaflet"
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              maxZoom={19}
            />

            <FlyTo target={selected} />

            {filtered.map((proj) => {
              const isActive = selected?.id === proj.id;
              return (
                <Marker
                  key={proj.id}
                  position={[proj.lat, proj.lng]}
                  icon={createMarkerIcon(proj.status, isActive)}
                  ref={(r) => { if (r) markerRefs.current[proj.id] = r; }}
                  eventHandlers={{ click: () => setSelected(proj) }}
                >
                  <Popup className="mp-popup-root">
                    <div className="mp-popup">
                      <div className="mp-popup-title">{proj.name}</div>
                      <div className="mp-popup-row">
                        <span className="mp-popup-label">Région</span>
                        <span className="mp-popup-val">{proj.region}</span>
                      </div>
                      <div className="mp-popup-row">
                        <span className="mp-popup-label">Type</span>
                        <span className="mp-popup-val">{proj.type}</span>
                      </div>
                      <div className="mp-popup-row">
                        <span className="mp-popup-label">Budget</span>
                        <span className="mp-popup-val mp-popup-budget">{fmt(proj.budget)}</span>
                      </div>
                      <div className="mp-popup-row">
                        <span className="mp-popup-label">Statut</span>
                        <span
                          className="mp-popup-status"
                          style={{
                            color: STATUS[proj.status].color,
                            borderColor: `${STATUS[proj.status].color}55`,
                            background: `${STATUS[proj.status].color}18`,
                          }}
                        >
                          {proj.status}
                        </span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Legend */}
          <div className="mp-legend">
            {Object.entries(STATUS).map(([key, cfg]) => (
              <div key={key} className="mp-legend-item">
                <span className="mp-legend-dot" style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.glow}` }} />
                <span className="mp-legend-label">{key}</span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #020811;
    --bg2:       #07111f;
    --bg3:       #0c1a2e;
    --border:    rgba(56,189,248,0.12);
    --border2:   rgba(56,189,248,0.22);
    --text:      #c8d8e8;
    --text-dim:  #5a7a96;
    --cyan:      #38bdf8;
    --green:     #00ff88;
    --yellow:    #fbbf24;
    --font:      'Rajdhani', sans-serif;
    --mono:      'JetBrains Mono', monospace;
  }

  /* ── ROOT LAYOUT ── */
  .mp-root {
    display: flex;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: var(--bg);
    font-family: var(--font);
    color: var(--text);
  }

  /* ── SIDEBAR ── */
  .mp-sidebar {
    width: 320px;
    min-width: 280px;
    max-width: 340px;
    display: flex;
    flex-direction: column;
    background: linear-gradient(180deg, #05101e 0%, #020c18 100%);
    border-right: 1px solid var(--border2);
    overflow: hidden;
    position: relative;
    z-index: 10;
  }
  .mp-sidebar::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--cyan), transparent);
    opacity: 0.6;
  }

  /* Logo */
  .mp-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px 20px 16px;
    border-bottom: 1px solid var(--border);
  }
  .mp-logo-icon {
    font-size: 28px;
    color: var(--cyan);
    filter: drop-shadow(0 0 8px var(--cyan));
    line-height: 1;
  }
  .mp-logo-title {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 3px;
    color: #fff;
    text-transform: uppercase;
  }
  .mp-logo-sub {
    font-size: 10px;
    color: var(--text-dim);
    letter-spacing: 1px;
    text-transform: uppercase;
    font-family: var(--mono);
    margin-top: 1px;
  }

  /* Search */
  .mp-search-wrap {
    position: relative;
    margin: 14px 16px 10px;
  }
  .mp-search-icon {
    position: absolute;
    left: 11px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-dim);
    font-size: 18px;
    pointer-events: none;
  }
  .mp-search {
    width: 100%;
    padding: 9px 34px 9px 34px;
    background: rgba(56,189,248,0.05);
    border: 1px solid var(--border2);
    border-radius: 8px;
    color: var(--text);
    font-family: var(--font);
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .mp-search::placeholder { color: var(--text-dim); }
  .mp-search:focus {
    border-color: var(--cyan);
    box-shadow: 0 0 12px rgba(56,189,248,0.2);
  }
  .mp-search-clear {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--text-dim);
    cursor: pointer;
    font-size: 12px;
    padding: 2px;
  }
  .mp-search-clear:hover { color: var(--text); }

  /* Pills */
  .mp-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 0 16px 12px;
  }
  .mp-pill {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 20px;
    border: 1px solid var(--border2);
    background: transparent;
    color: var(--text-dim);
    font-family: var(--font);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: all 0.18s;
  }
  .mp-pill:hover { color: var(--text); border-color: rgba(56,189,248,0.35); }
  .mp-pill--active { color: var(--cyan) !important; border-color: var(--cyan) !important; }
  .mp-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  /* Stats */
  .mp-stats {
    display: flex;
    gap: 0;
    margin: 0 16px 14px;
    border: 1px solid var(--border);
    border-radius: 10px;
    overflow: hidden;
    background: rgba(56,189,248,0.03);
  }
  .mp-stat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px 4px;
    border-right: 1px solid var(--border);
  }
  .mp-stat:last-child { border-right: none; }
  .mp-stat-val {
    font-size: 22px;
    font-weight: 700;
    color: var(--cyan);
    line-height: 1;
  }
  .mp-stat-label {
    font-size: 10px;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-top: 3px;
    font-family: var(--mono);
  }

  /* List */
  .mp-list-header {
    padding: 0 18px 6px;
    font-size: 11px;
    color: var(--text-dim);
    font-family: var(--mono);
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom: 1px solid var(--border);
    padding-bottom: 8px;
  }
  .mp-list {
    list-style: none;
    overflow-y: auto;
    flex: 1;
    scrollbar-width: thin;
    scrollbar-color: rgba(56,189,248,0.2) transparent;
  }
  .mp-list::-webkit-scrollbar { width: 4px; }
  .mp-list::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.2); border-radius: 4px; }

  .mp-empty {
    padding: 24px;
    text-align: center;
    color: var(--text-dim);
    font-size: 14px;
    font-family: var(--mono);
  }

  .mp-item {
    padding: 12px 16px;
    border-left: 3px solid transparent;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    transition: background 0.15s, border-left-color 0.15s;
    position: relative;
  }
  .mp-item:hover { background: rgba(56,189,248,0.06); }
  .mp-item--active { background: rgba(56,189,248,0.07); }

  .mp-item-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 5px;
  }
  .mp-item-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .mp-item-name {
    font-size: 13px;
    font-weight: 600;
    color: #e2eaf4;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: var(--mono);
  }
  .mp-item-meta {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: var(--text-dim);
    margin-bottom: 6px;
    padding-left: 16px;
  }
  .mp-item-budget { color: #7dd3fc; font-family: var(--mono); }
  .mp-item-badge {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    border: 1px solid;
    border-radius: 4px;
    padding: 2px 7px;
    margin-left: 16px;
    font-family: var(--mono);
  }

  /* ── MAP AREA ── */
  .mp-map-wrap {
    flex: 1;
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Top bar */
  .mp-topbar {
    position: absolute;
    top: 0; left: 0; right: 0;
    z-index: 500;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 18px;
    background: linear-gradient(180deg, rgba(2,8,17,0.92) 0%, transparent 100%);
    pointer-events: none;
  }
  .mp-topbar-left { display: flex; align-items: center; gap: 10px; }
  .mp-topbar-pulse {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--green);
    box-shadow: 0 0 10px var(--green);
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.85); }
  }
  .mp-topbar-live {
    font-size: 11px;
    font-weight: 700;
    color: var(--green);
    letter-spacing: 2px;
    font-family: var(--mono);
  }
  .mp-topbar-label {
    font-size: 13px;
    color: var(--text-dim);
    letter-spacing: 1px;
    font-family: var(--mono);
  }
  .mp-topbar-budget {
    font-size: 13px;
    color: var(--cyan);
    font-family: var(--mono);
    letter-spacing: 0.5px;
  }

  /* Leaflet map */
  .mp-leaflet {
    flex: 1;
    width: 100%;
    height: 100%;
    background: var(--bg);
  }

  /* Popup override */
  .leaflet-popup-content-wrapper {
    background: rgba(5,14,28,0.97) !important;
    border: 1px solid rgba(56,189,248,0.3) !important;
    border-radius: 10px !important;
    box-shadow: 0 0 24px rgba(56,189,248,0.2) !important;
    padding: 0 !important;
  }
  .leaflet-popup-tip { background: rgba(5,14,28,0.97) !important; }
  .leaflet-popup-content { margin: 0 !important; }
  .leaflet-popup-close-button {
    color: var(--text-dim) !important;
    font-size: 16px !important;
    top: 8px !important;
    right: 10px !important;
  }

  .mp-popup { padding: 14px 16px 14px; min-width: 210px; }
  .mp-popup-title {
    font-size: 14px;
    font-weight: 700;
    color: #e2eaf4;
    font-family: var(--mono);
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(56,189,248,0.15);
    letter-spacing: 0.3px;
  }
  .mp-popup-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    gap: 12px;
  }
  .mp-popup-label {
    font-size: 11px;
    color: var(--text-dim);
    font-family: var(--mono);
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }
  .mp-popup-val {
    font-size: 12px;
    color: var(--text);
    font-family: var(--mono);
    text-align: right;
  }
  .mp-popup-budget { color: #7dd3fc; font-weight: 600; }
  .mp-popup-status {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    border: 1px solid;
    border-radius: 4px;
    padding: 2px 8px;
    font-family: var(--mono);
  }

  /* Legend */
  .mp-legend {
    position: absolute;
    bottom: 20px;
    right: 16px;
    z-index: 500;
    background: rgba(5,14,28,0.88);
    border: 1px solid var(--border2);
    border-radius: 10px;
    padding: 10px 14px;
    display: flex;
    flex-direction: column;
    gap: 7px;
    backdrop-filter: blur(10px);
  }
  .mp-legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .mp-legend-dot {
    width: 9px; height: 9px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .mp-legend-label {
    font-size: 11px;
    color: var(--text-dim);
    font-family: var(--mono);
    letter-spacing: 0.5px;
  }

  /* Leaflet attribution */
  .leaflet-control-attribution {
    background: rgba(2,8,17,0.75) !important;
    color: #3a5068 !important;
    font-size: 9px !important;
  }
  .leaflet-control-attribution a { color: #4a7090 !important; }
  .leaflet-control-zoom {
    border: 1px solid var(--border2) !important;
    border-radius: 8px !important;
    overflow: hidden;
    margin: 60px 14px !important;
  }
  .leaflet-control-zoom a {
    background: rgba(5,14,28,0.9) !important;
    color: var(--cyan) !important;
    border-bottom-color: var(--border) !important;
  }
  .leaflet-control-zoom a:hover { background: rgba(56,189,248,0.12) !important; }

  /* ── RESPONSIVE ── */
  @media (max-width: 768px) {
    .mp-root { flex-direction: column; }
    .mp-sidebar {
      width: 100%;
      max-width: 100%;
      height: 45vh;
      border-right: none;
      border-bottom: 1px solid var(--border2);
    }
    .mp-map-wrap { height: 55vh; }
    .mp-topbar-label { display: none; }
    .mp-legend { bottom: 10px; right: 8px; padding: 8px 10px; gap: 5px; }
  }
`;
