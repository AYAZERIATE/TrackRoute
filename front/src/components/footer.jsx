import { useState } from "react";
import { FiCompass } from "react-icons/fi";
import {
  colors,
  typography,
  spacing,
  radius,
  transitions,
  badgeStyles,
} from "../styles/theme";

const NAV_LINKS = [
  { label: "Docs",    href: "#" },
  { label: "Support", href: "#" },
  { label: "Privacy", href: "#" },
];

function FooterLink({ href, label }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontSize:      typography.size.sm,
        fontWeight:    typography.weight.medium,
        color:         hovered ? colors.brand[400] : colors.text.muted,
        textDecoration:"none",
        letterSpacing: "0.02em",
        transition:    `color ${transitions.default}`,
        fontFamily:    typography.fontFamily,
      }}
    >
      {label}
    </a>
  );
}

// ── Footer ────────────────────────────────────────────────────
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background:    colors.bg.surface,
        borderTop:     `1px solid ${colors.border.subtle}`,
        fontFamily:    typography.fontFamily,
        position:      "relative",
        overflow:      "hidden",
      }}
    >
      {/* Top accent line */}
      <div
        aria-hidden="true"
        style={{
          position:   "absolute",
          top:        0,
          left:       "10%",
          right:      "10%",
          height:     "1px",
          background: "linear-gradient(90deg, transparent, rgba(96,165,250,0.3), transparent)",
        }}
      />

      {/* Decorative glow */}
      <div
        aria-hidden="true"
        style={{
          position:   "absolute",
          bottom:     "-40px",
          right:      "-40px",
          width:      "160px",
          height:     "160px",
          background: "radial-gradient(circle, rgba(96,165,250,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Content row */}
      <div
        style={{
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "center",
          flexWrap:       "wrap",
          gap:            spacing[4],
          maxWidth:       "1100px",
          margin:         "0 auto",
          padding:        `18px ${spacing[7]}`,
          position:       "relative",
          zIndex:         1,
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: spacing[3] }}>
          <div
            style={{
              width:          "28px",
              height:         "28px",
              minWidth:       "28px",
              background:     `linear-gradient(135deg, ${colors.brand[600]} 0%, ${colors.brand[700]} 100%)`,
              borderRadius:   radius.lg,
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              boxShadow:      `0 6px 18px ${colors.brand.glow}`,
            }}
          >
            <FiCompass style={{ color: "#fff", fontSize: "14px" }} aria-hidden="true" />
          </div>

          <span
            style={{
              fontSize:      typography.size.base,
              fontWeight:    typography.weight.bold,
              color:         colors.text.secondary,
              letterSpacing: "-0.01em",
            }}
          >
            TrackRoute
          </span>

          <span style={badgeStyles("brand")}>Admin</span>
        </div>

        {/* Links + copyright */}
        <div
          style={{
            display:    "flex",
            alignItems: "center",
            flexWrap:   "wrap",
            gap:        spacing[6],
          }}
        >
          <nav style={{ display: "flex", gap: spacing[5], alignItems: "center" }}>
            {NAV_LINKS.map((link) => (
              <FooterLink key={link.label} {...link} />
            ))}
          </nav>

          {/* Dot separator */}
          <span
            aria-hidden="true"
            style={{
              width:        "3px",
              height:       "3px",
              borderRadius: "50%",
              background:   colors.text.faint,
              display:      "inline-block",
            }}
          />

          <span
            style={{
              fontSize:      typography.size.sm,
              color:         colors.text.muted,
              letterSpacing: "0.02em",
              fontWeight:    typography.weight.medium,
            }}
          >
            © {year} TrackRoute
          </span>
        </div>
      </div>
    </footer>
  );
}