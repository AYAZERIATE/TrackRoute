
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiHome, FiBriefcase, FiDollarSign,
  FiCalendar, FiMap, FiLogOut, FiCompass,
} from "react-icons/fi";
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  transitions,
  badgeStyles,
} from "../styles/theme";

// ── Route definitions ─────────────────────────────────────────
const NAV_ITEMS = [
  { to: "/dashboard",         label: "Tableau de bord", icon: FiHome        },
  { to: "/gestion-marche",    label: "Marché",           icon: FiBriefcase   },
  { to: "/gestion-loi-finance", label: "Finance",        icon: FiDollarSign  },
  { to: "/agenda",            label: "Agenda",           icon: FiCalendar    },
  { to: "/map",               label: "Carte",            icon: FiMap         },
];

// ── NavItem ───────────────────────────────────────────────────
function NavItem({ to, label, icon: Icon, collapsed, onNavigate }) {
  const [hovered, setHovered] = useState(false);

  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onNavigate?.()}
      style={({ isActive }) => ({
        display:        "flex",
        alignItems:     "center",
        justifyContent: collapsed ? "center" : "flex-start",
        gap:            collapsed ? 0 : spacing[4],
        padding:        collapsed ? `${spacing[3]} 0` : `${spacing[3]} ${spacing[4]}`,
        borderRadius:   radius.xl,
        textDecoration: "none",
        fontSize:       typography.size.md,
        fontWeight:     isActive ? typography.weight.semibold : typography.weight.medium,
        color:          isActive
                          ? colors.text.secondary
                          : hovered
                          ? "#dbeafe"
                          : colors.text.muted,
        background:     isActive
                          ? colors.brand.active
                          : hovered
                          ? colors.brand.subtle
                          : "transparent",
        border:         `1px solid ${isActive ? colors.brand.activeBorder : "transparent"}`,
        boxShadow:      isActive ? shadows.inset : "none",
        transition:     `all ${transitions.default}`,
        fontFamily:     typography.fontFamily,
        whiteSpace:     "nowrap",
        overflow:       "hidden",
      })}
    >
      {({ isActive }) => (
        <>
          <span
            style={{
              width:          "34px",
              height:         "34px",
              minWidth:       "34px",
              borderRadius:   radius.lg,
              display:        "inline-flex",
              alignItems:     "center",
              justifyContent: "center",
              background:     isActive ? colors.brand.active : "transparent",
              color:          isActive
                                ? colors.brand[400]
                                : hovered
                                ? "#93c5fd"
                                : colors.text.muted,
              transition:     `color ${transitions.default}, background ${transitions.default}`,
            }}
          >
            <Icon size={18} />
          </span>

          {!collapsed && (
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
              {label}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

// ── Logout Button ─────────────────────────────────────────────
function LogoutButton({ onClick, collapsed }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Déconnexion"
      style={{
        width:          "100%",
        display:        "flex",
        alignItems:     "center",
        justifyContent: collapsed ? "center" : "flex-start",
        gap:            collapsed ? 0 : spacing[3],
        padding:        `${spacing[3]} ${spacing[4]}`,
        borderRadius:   radius.xl,
        background:     hovered ? colors.brand.subtle : "rgba(255,255,255,0.04)",
        border:         `1px solid ${hovered ? colors.brand.activeBorder : "transparent"}`,
        color:          hovered ? colors.text.secondary : colors.text.muted,
        fontSize:       typography.size.base,
        fontWeight:     typography.weight.semibold,
        cursor:         "pointer",
        transition:     `all ${transitions.default}`,
        letterSpacing:  "0.01em",
        fontFamily:     typography.fontFamily,
        whiteSpace:     "nowrap",
        overflow:       "hidden",
      }}
    >
      <FiLogOut size={18} style={{ minWidth: 18 }} />
      {!collapsed && "Déconnexion"}
    </button>
  );
}

// ── Sidebar ───────────────────────────────────────────────────
/**
 * @param {boolean} collapsed      — icon-only mode (desktop)
 * @param {boolean} open           — visible/hidden (mobile)
 * @param {boolean} isMobile
 * @param {object}  styleOverride  — CSS overrides from Layout
 * @param {()=>void} onNavigate    — callback after link click
 */
export default function Sidebar({
  collapsed     = false,
  open          = true,
  isMobile      = false,
  styleOverride = {},
  onNavigate,
}) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_BASEURL}/api/auth/logout`, {
        method:  "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
          Accept:        "application/json",
        },
      });
    } catch {
      // intentionally ignored — always clear local state
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("auth");
    navigate("/login", { replace: true });
  };

  return (
    <aside
      style={{
        // Base
        height:           "100vh",
        background:       colors.bg.surface,
        borderRight:      `1px solid ${colors.border.subtle}`,
        display:          "flex",
        flexDirection:    "column",
        fontFamily:       typography.fontFamily,
        overflow:         "hidden",
        transition:       `width ${transitions.slow}, transform ${transitions.slow}`,
        boxSizing:        "border-box",
        backdropFilter:   "blur(12px)",
        // Overrides from Layout (position, width, zIndex, boxShadow…)
        ...styleOverride,
      }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        style={{
          position:      "absolute",
          top:           "-50px",
          left:          "-50px",
          width:         "180px",
          height:        "180px",
          background:    "radial-gradient(circle, rgba(96,165,250,0.14) 0%, transparent 72%)",
          pointerEvents: "none",
          zIndex:        0,
        }}
      />

      {/* ── Logo ─────────────────────────────────────── */}
      <div
        style={{
          padding:        `${spacing[5]} ${spacing[4]}`,
          borderBottom:   `1px solid ${colors.border.subtle}`,
          display:        "flex",
          alignItems:     "center",
          gap:            spacing[3],
          position:       "relative",
          zIndex:         1,
          minHeight:      "70px",
        }}
      >
        <div
          style={{
            width:          "38px",
            height:         "38px",
            minWidth:       "38px",
            background:     `linear-gradient(135deg, ${colors.brand[600]} 0%, ${colors.brand[700]} 100%)`,
            borderRadius:   radius.xl,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            boxShadow:      shadows.brand,
          }}
        >
          <FiCompass style={{ color: "#fff", fontSize: "18px" }} aria-hidden="true" />
        </div>

        {!collapsed && (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
            <p
              style={{
                margin:        0,
                fontSize:      typography.size.lg,
                fontWeight:    typography.weight.bold,
                color:         colors.text.primary,
                letterSpacing: "-0.02em",
                whiteSpace:    "nowrap",
              }}
            >
              TrackRoute
            </p>
            <p style={{ margin: 0, ...badgeStyles("brand"), border: "none", background: "none", padding: 0 }}>
              Admin Panel
            </p>
          </div>
        )}
      </div>

      {/* ── Navigation ───────────────────────────────── */}
      <nav
        aria-label="Main navigation"
        style={{
          flex:                    1,
          padding:                 `${spacing[4]} ${spacing[3]} ${spacing[4]}`,
          display:                 "flex",
          flexDirection:           "column",
          gap:                     spacing[1],
          overflowY:               "auto",
          WebkitOverflowScrolling: "touch",
          position:                "relative",
          zIndex:                  1,
          // Hide scrollbar visually but keep it functional
          scrollbarWidth:          "none",
        }}
      >
        {!collapsed && (
          <p
            style={{
              margin:        `0 0 ${spacing[2]} ${spacing[2]}`,
              fontSize:      typography.size.xs,
              fontWeight:    typography.weight.bold,
              color:         colors.text.faint,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
            }}
          >
            Navigation
          </p>
        )}

        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.to}
            {...item}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {/* ── Footer / Logout ───────────────────────────── */}
      <div
        style={{
          padding:    `${spacing[4]} ${spacing[3]} ${spacing[5]}`,
          borderTop:  `1px solid ${colors.border.subtle}`,
          position:   "relative",
          zIndex:     1,
        }}
      >
        {/* Gradient divider */}
        <div
          aria-hidden="true"
          style={{
            height:     "1px",
            background: "linear-gradient(90deg, transparent, rgba(96,165,250,0.16), transparent)",
            margin:     `0 ${spacing[2]} ${spacing[3]}`,
          }}
        />
        <LogoutButton collapsed={collapsed} onClick={handleLogout} />
      </div>
    </aside>
  );
}