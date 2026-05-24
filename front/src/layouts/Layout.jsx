// ─────────────────────────────────────────────────────────────
//  Layout.jsx  —  TrackRoute Admin
//  Authenticated shell: Sidebar + Header + Outlet + Footer
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { Outlet, Navigate } from "react-router-dom";
import Sidebar  from "../components/Sidebar";
import Footer   from "../components/Footer";
import Loading  from "../components/Loading";
import api      from "../api/axios";
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  transitions,
  breakpoints,
  sidebarDimensions,
  zIndex,
  iconButtonStyles,
} from "../styles/theme";

// ── useWindowWidth ─────────────────────────────────────────────
function useWindowWidth() {
  const [width, setWidth] = useState(() => window.innerWidth);

  useEffect(() => {
    let frameId;
    const onResize = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => setWidth(window.innerWidth));
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return width;
}

// ── useAuth ────────────────────────────────────────────────────
function useAuth() {
  const [state, setState] = useState({ checked: false, authed: false });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await api.get("/auth/me");
        if (!cancelled) setState({ checked: true, authed: true });
      } catch {
        if (!cancelled) setState({ checked: true, authed: false });
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return state;
}

// ── HamburgerButton ────────────────────────────────────────────
function HamburgerButton({ isMobile, sidebarOpen, sidebarCollapsed, onToggle }) {
  const [hovered, setHovered] = useState(false);
  const isOpen  = isMobile ? sidebarOpen : !sidebarCollapsed;

  const ariaLabel = isMobile
    ? (sidebarOpen ? "Fermer le menu" : "Ouvrir le menu")
    : (sidebarCollapsed ? "Développer le menu" : "Réduire le menu");

  return (
    <button
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={ariaLabel}
      style={iconButtonStyles(hovered)}
    >
      {isMobile && isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
    </button>
  );
}

// ── Layout ─────────────────────────────────────────────────────
export default function Layout() {
  const windowWidth = useWindowWidth();
  const { checked, authed } = useAuth();

  const isMobile = windowWidth < breakpoints.mobile;
  const isTablet = windowWidth >= breakpoints.mobile && windowWidth <= breakpoints.tablet;

  const [sidebarOpen, setSidebarOpen]           = useState(!isMobile);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isTablet);

  // Sync sidebar state on breakpoint change
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
      setSidebarCollapsed(false);
    } else {
      setSidebarOpen(true);
      setSidebarCollapsed(isTablet);
    }
  }, [isMobile, isTablet]);

  // ── Derived values ────────────────────────────────────────
  const sidebarWidth = isMobile
    ? sidebarDimensions.mobile
    : sidebarCollapsed
    ? sidebarDimensions.collapsed
    : sidebarDimensions.expanded;

  const contentMargin = !isMobile && sidebarOpen ? sidebarWidth : 0;

  // ── Toggle ────────────────────────────────────────────────
  const handleToggle = () => {
    if (isMobile) {
      setSidebarOpen((v) => !v);
    } else {
      setSidebarCollapsed((v) => !v);
    }
  };

  // ── Guards ────────────────────────────────────────────────
  if (!checked) return <Loading variant="fullscreen" message="Vérification…" />;
  if (!authed)  return <Navigate to="/login" replace />;

  // ── Render ────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight:   "100vh",
        width:       "100%",
        overflowX:   "hidden",
        display:     "flex",
        background:  colors.bg.base,
        fontFamily:  typography.fontFamily,
      }}
    >
      {/* ── Sidebar ──────────────────────────────────── */}
      <Sidebar
        collapsed={!isMobile && sidebarCollapsed}
        open={sidebarOpen}
        isMobile={isMobile}
        styleOverride={{
          width:     sidebarOpen ? sidebarWidth : 0,
          minWidth:  sidebarOpen ? sidebarWidth : 0,
          position:  "fixed",
          top:       0,
          left:      0,
          bottom:    0,
          transform: isMobile && !sidebarOpen ? "translateX(-100%)" : "translateX(0)",
          zIndex:    zIndex.sidebar,
          boxShadow: isMobile && sidebarOpen ? shadows.modal : "none",
        }}
        onNavigate={() => { if (isMobile) setSidebarOpen(false); }}
      />

      {/* ── Mobile overlay ───────────────────────────── */}
      {isMobile && (
        <div
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
          style={{
            position:   "fixed",
            inset:      0,
            background: colors.bg.overlay,
            opacity:    sidebarOpen ? 1 : 0,
            visibility: sidebarOpen ? "visible" : "hidden",
            transition: `opacity ${transitions.default}, visibility ${transitions.default}`,
            zIndex:     zIndex.overlay,
          }}
        />
      )}

      {/* ── Main content ─────────────────────────────── */}
      <div
        style={{
          flex:          1,
          minWidth:      0,
          marginLeft:    contentMargin,
          transition:    `margin-left ${transitions.slow}`,
          display:       "flex",
          flexDirection: "column",
          minHeight:     "100vh",
          position:      "relative",
          background:    "linear-gradient(180deg, rgba(9,12,24,0.96) 0%, rgba(11,16,34,1) 100%)",
          overflow:      "hidden",
        }}
      >
        {/* ── Header ───────────────────────────────── */}
        <header
          style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            gap:            spacing[4],
            padding:        `18px ${spacing[6]}`,
            borderBottom:   `1px solid ${colors.border.subtle}`,
            background:     colors.bg.surface,
            position:       "sticky",
            top:            0,
            zIndex:         zIndex.header,
            backdropFilter: "blur(12px)",
          }}
        >
          <HamburgerButton
            isMobile={isMobile}
            sidebarOpen={sidebarOpen}
            sidebarCollapsed={sidebarCollapsed}
            onToggle={handleToggle}
          />

          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin:        0,
                fontSize:      typography.size.xs,
                color:         colors.text.muted,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontWeight:    typography.weight.semibold,
              }}
            >
              Admin Dashboard
            </p>
            <h1
              style={{
                margin:     `${spacing[1]} 0 0`,
                fontSize:   typography.size.xl,
                fontWeight: typography.weight.bold,
                color:      colors.text.primary,
                lineHeight: 1.2,
              }}
            >
              Bienvenue, Admin
            </h1>
          </div>

          {/* User chip */}
          <div
            style={{
              display:      "inline-flex",
              alignItems:   "center",
              gap:          spacing[3],
              padding:      `10px ${spacing[4]}`,
              borderRadius: radius.xl,
              background:   colors.bg.card,
              border:       `1px solid ${colors.border.subtle}`,
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width:          "30px",
                height:         "30px",
                borderRadius:   "50%",
                background:     `linear-gradient(135deg, ${colors.brand[600]}, ${colors.brand[700]})`,
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                fontSize:       typography.size.sm,
                fontWeight:     typography.weight.bold,
                color:          "#fff",
              }}
            >
              A
            </div>
            <span
              style={{
                color:      colors.text.muted,
                fontSize:   typography.size.base,
                fontWeight: typography.weight.medium,
              }}
            >
              Admin
            </span>
          </div>
        </header>

        {/* ── Page content ─────────────────────────── */}
        <main
          style={{
            flex:          1,
            display:       "flex",
            flexDirection: "column",
            padding:       `${spacing[6]} ${spacing[5]} ${spacing[7]}`,
            minHeight:     0,
            width:         "100%",
            boxSizing:     "border-box",
            overflowX:     "hidden",
          }}
        >
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}