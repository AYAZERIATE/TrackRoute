
import React from "react";
import { FiCompass } from "react-icons/fi";
import { colors, typography, transitions } from "../styles/theme";

// ── Inline keyframes injected once ───────────────────────────
const STYLE_ID = "trackroute-loading-keyframes";
if (typeof document !== "undefined" && !document.getElementById(STYLE_ID)) {
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes tr-spin {
      to { transform: rotate(360deg); }
    }
    @keyframes tr-pulse-ring {
      0%   { transform: scale(0.9); opacity: 0.7; }
      50%  { transform: scale(1.08); opacity: 0.25; }
      100% { transform: scale(0.9); opacity: 0.7; }
    }
    @keyframes tr-fade-in {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes tr-dot-bounce {
      0%, 80%, 100% { transform: translateY(0);    opacity: 0.4; }
      40%            { transform: translateY(-6px); opacity: 1;   }
    }
  `;
  document.head.appendChild(style);
}

// ── Dot bounce (used by "dots" variant) ──────────────────────
function BounceDots() {
  return (
    <div style={{ display: "flex", gap: "7px", alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: colors.brand[400],
            display: "inline-block",
            animation: `tr-dot-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ── Ring spinner ─────────────────────────────────────────────
function RingSpinner({ size = 36 }) {
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {/* Pulse ring */}
      <span
        style={{
          position:     "absolute",
          inset:        "-4px",
          borderRadius: "50%",
          border:       `2px solid ${colors.brand.subtle}`,
          animation:    `tr-pulse-ring 1.8s ease-in-out infinite`,
        }}
      />
      {/* Spinning arc */}
      <span
        style={{
          display:      "block",
          width:        "100%",
          height:       "100%",
          borderRadius: "50%",
          border:       `2.5px solid ${colors.border.subtle}`,
          borderTopColor: colors.brand[400],
          animation:    `tr-spin 0.75s linear infinite`,
        }}
      />
      {/* Center icon */}
      <span
        style={{
          position:       "absolute",
          inset:          0,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          color:          colors.brand[400],
        }}
      >
        <FiCompass size={size * 0.38} />
      </span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
/**
 * @param {"fullscreen"|"inline"|"overlay"} variant
 *   - fullscreen  fills the whole viewport
 *   - inline      sizes itself to the parent container (use `height` prop)
 *   - overlay     fixed dark overlay on top of existing content
 * @param {string}  height   CSS height (only used by "inline" variant)
 * @param {string}  message  Optional loading label
 * @param {"ring"|"dots"} spinner  Spinner style
 */
export default function Loading({
  variant = "fullscreen",
  height  = "100%",
  message = "Loading…",
  spinner = "ring",
}) {
  const isFixed = variant === "fullscreen" || variant === "overlay";

  const containerStyle = {
    // Layout
    display:        "flex",
    flexDirection:  "column",
    alignItems:     "center",
    justifyContent: "center",
    gap:            "18px",

    // Sizing
    ...(variant === "inline"
      ? { height, minHeight: "120px" }
      : { position: isFixed ? "fixed" : "absolute", inset: 0 }),

    // Visual
    background:
      variant === "overlay"
        ? colors.bg.overlay
        : variant === "fullscreen"
        ? colors.bg.base
        : "transparent",

    zIndex: variant === "overlay" ? 9999 : "auto",
    backdropFilter: variant === "overlay" ? "blur(4px)" : "none",

    // Animation
    animation: `tr-fade-in 0.3s ease both`,

    // Font
    fontFamily: typography.fontFamily,
  };

  return (
    <div style={containerStyle} role="status" aria-live="polite" aria-label={message}>
      {spinner === "ring" ? <RingSpinner size={44} /> : <BounceDots />}

      {message && (
        <span
          style={{
            fontSize:      typography.size.sm,
            fontWeight:    typography.weight.medium,
            color:         colors.text.muted,
            letterSpacing: "0.04em",
            animation:     `tr-fade-in 0.5s ease 0.15s both`,
          }}
        >
          {message}
        </span>
      )}
    </div>
  );
}