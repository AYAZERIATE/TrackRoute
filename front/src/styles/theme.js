// ─────────────────────────────────────────────────────────────
//  TrackRoute Admin — Design Tokens & Shared Styles
//  Single source of truth for all visual constants
// ─────────────────────────────────────────────────────────────

// ── Colour Palette ──────────────────────────────────────────
export const colors = {
  // Backgrounds
  bg: {
    base: "#050712",
    surface: "rgba(7, 12, 27, 0.92)",
    elevated: "rgba(11, 18, 40, 0.96)",
    overlay: "rgba(1, 6, 22, 0.75)",
    card: "rgba(255, 255, 255, 0.03)",
    cardHover: "rgba(255, 255, 255, 0.055)",
  },

  // Brand blues
  brand: {
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    glow: "rgba(37, 99, 235, 0.24)",
    subtle: "rgba(96, 165, 250, 0.08)",
    subtleBorder: "rgba(96, 165, 250, 0.2)",
    active: "rgba(96, 165, 250, 0.14)",
    activeBorder: "rgba(96, 165, 250, 0.22)",
  },

  // Text
  text: {
    primary: "#f8fafc",
    secondary: "#e2e8f0",
    muted: "#94a3b8",
    faint: "#64748b",
  },

  // Borders
  border: {
    subtle: "rgba(148, 163, 184, 0.08)",
    medium: "rgba(148, 163, 184, 0.18)",
    strong: "rgba(148, 163, 184, 0.32)",
  },

  // Semantic
  success: { bg: "rgba(34,197,94,0.12)", text: "#4ade80", border: "rgba(34,197,94,0.22)" },
  warning: { bg: "rgba(251,191,36,0.12)", text: "#fbbf24", border: "rgba(251,191,36,0.22)" },
  danger:  { bg: "rgba(239,68,68,0.12)",  text: "#f87171", border: "rgba(239,68,68,0.22)"  },
};

// ── Typography ────────────────────────────────────────────────
export const typography = {
  fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",

  size: {
    xs:   "10px",
    sm:   "11.5px",
    base: "13.5px",
    md:   "14px",
    lg:   "16px",
    xl:   "20px",
    "2xl": "24px",
    "3xl": "30px",
  },

  weight: {
    normal:    400,
    medium:    500,
    semibold:  600,
    bold:      700,
    extrabold: 800,
  },

  lineHeight: {
    tight:  1.2,
    normal: 1.5,
    loose:  1.8,
  },
};

// ── Spacing ───────────────────────────────────────────────────
export const spacing = {
  0:  "0px",
  1:  "4px",
  2:  "8px",
  3:  "12px",
  4:  "16px",
  5:  "20px",
  6:  "24px",
  7:  "28px",
  8:  "32px",
  10: "40px",
  12: "48px",
};

// ── Border Radius ─────────────────────────────────────────────
export const radius = {
  sm:   "6px",
  md:   "10px",
  lg:   "14px",
  xl:   "16px",
  "2xl":"20px",
  full: "9999px",
};

// ── Shadows ───────────────────────────────────────────────────
export const shadows = {
  brand:  "0 8px 28px rgba(37, 99, 235, 0.22)",
  card:   "0 4px 24px rgba(0, 0, 0, 0.32)",
  modal:  "0 28px 80px rgba(0, 0, 0, 0.48)",
  inset:  "inset 0 1px 0 rgba(255,255,255,0.08)",
};

// ── Transitions ───────────────────────────────────────────────
export const transitions = {
  fast:    "0.15s ease",
  default: "0.25s ease",
  slow:    "0.35s ease",
};

// ── Layout Breakpoints ────────────────────────────────────────
export const breakpoints = {
  mobile:  768,
  tablet: 1024,
};

// ── Sidebar Dimensions ────────────────────────────────────────
export const sidebarDimensions = {
  expanded:  260,
  collapsed:  86,
  mobile:    280,
};

// ── Z-Index Scale ─────────────────────────────────────────────
export const zIndex = {
  base:    1,
  header: 30,
  overlay: 40,
  sidebar: 50,
  modal:  100,
  toast:  200,
};

// ── Reusable Component Style Factories ────────────────────────

/** Returns styles for a pill / badge */
export const badgeStyles = (variant = "brand") => {
  const map = {
    brand:   { bg: colors.brand.subtle,   color: colors.brand[400], border: colors.brand.subtleBorder },
    success: colors.success,
    warning: colors.warning,
    danger:  colors.danger,
  };
  const t = map[variant] ?? map.brand;
  return {
    display:       "inline-flex",
    alignItems:    "center",
    gap:           "5px",
    fontSize:      typography.size.xs,
    fontWeight:    typography.weight.semibold,
    background:    t.bg,
    color:         t.text ?? t.color,
    border:        `1px solid ${t.border}`,
    borderRadius:  radius.sm,
    padding:       "2px 8px",
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    lineHeight:    1.6,
  };
};

/** Returns styles for an icon button */
export const iconButtonStyles = (hovered = false) => ({
  display:        "inline-flex",
  alignItems:     "center",
  justifyContent: "center",
  width:          "44px",
  height:         "44px",
  borderRadius:   radius.lg,
  border:         `1px solid ${hovered ? colors.brand.activeBorder : colors.border.medium}`,
  background:     hovered ? colors.brand.subtle : "rgba(15, 23, 42, 0.88)",
  color:          hovered ? colors.text.secondary : colors.text.muted,
  cursor:         "pointer",
  transition:     `all ${transitions.default}`,
});

/** Returns styles for a glass-style card */
export const cardStyles = (hovered = false) => ({
  background:   hovered ? colors.bg.cardHover : colors.bg.card,
  border:       `1px solid ${colors.border.subtle}`,
  borderRadius: radius.xl,
  padding:      spacing[6],
  transition:   `background ${transitions.default}`,
  boxShadow:    shadows.card,
});

export default {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  transitions,
  breakpoints,
  sidebarDimensions,
  zIndex,
  badgeStyles,
  iconButtonStyles,
  cardStyles,
};