/**
 * TechnoLogsLogo.jsx
 * Cellphone-repair themed logo — phone body + screwdriver/wrench overlay.
 * No image file required. Orbitron (display) + DM Sans (body).
 *
 * Usage:
 *   import TechnoLogsLogo from '../components/shared/TechnoLogsLogo';
 *   <TechnoLogsLogo size="md" />   // size: "sm" | "md" | "lg"
 */
import React from 'react';

const sizes = {
  sm: { width: 160, iconSize: 28, titleSize: 18, subSize: 8 },
  md: { width: 220, iconSize: 38, titleSize: 24, subSize: 10 },
  lg: { width: 300, iconSize: 50, titleSize: 32, subSize: 13 },
};

export default function TechnoLogsLogo({ size = 'md', className = '' }) {
  const s = sizes[size] ?? sizes.md;
  const gap = Math.round(s.iconSize * 0.3);

  return (
    <>
      <style>{`

        .tl-logo-wrap {
          display: inline-flex;
          align-items: center;
          gap: ${gap}px;
        }
        .tl-logo-icon { flex-shrink: 0; }
        .tl-logo-text {
          display: flex;
          flex-direction: column;
          line-height: 1;
        }
        .tl-logo-name {
          font-family: 'Orbitron', sans-serif;
          font-weight: 900;
          font-size: ${s.titleSize}px;
          letter-spacing: -0.5px;
          color: #0a1c16;
          text-transform: uppercase;
        }
        .tl-logo-name span { color: #1abc9c; }
        .tl-logo-sub {
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          font-size: ${s.subSize}px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(10,28,22,0.45);
          margin-top: ${Math.round(s.subSize * 0.4)}px;
        }
      `}</style>

      <div className={`tl-logo-wrap ${className}`}>

        {/* ── Icon: phone body + screwdriver ── */}
        <svg
          className="tl-logo-icon"
          width={s.iconSize}
          height={s.iconSize}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Phone body */}
          <rect
            x="11" y="4" width="22" height="36"
            rx="4" ry="4"
            fill="#1abc9c"
            opacity="0.13"
          />
          <rect
            x="11" y="4" width="22" height="36"
            rx="4" ry="4"
            stroke="#1abc9c"
            strokeWidth="2"
            fill="none"
          />

          {/* Screen area */}
          <rect
            x="14" y="9" width="16" height="22"
            rx="2"
            fill="#1abc9c"
            opacity="0.18"
          />

          {/* Home button / bottom indicator */}
          <rect
            x="20" y="34" width="4" height="2"
            rx="1"
            fill="#1abc9c"
            opacity="0.7"
          />

          {/* Speaker slot at top */}
          <rect
            x="19" y="6.5" width="6" height="1.5"
            rx="0.75"
            fill="#1abc9c"
            opacity="0.5"
          />

          {/* Screwdriver — overlaid diagonally, bottom-right */}
          {/* Handle (thick rounded rect) */}
          <rect
            x="28" y="28"
            width="7" height="4"
            rx="2"
            fill="#0aaa86"
            transform="rotate(-45 31.5 30)"
          />
          {/* Shaft */}
          <line
            x1="26" y1="26"
            x2="33" y2="33"
            stroke="#0a1c16"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.75"
          />
          {/* Tip (flat-head slot) */}
          <line
            x1="34" y1="34"
            x2="37" y2="37"
            stroke="#1abc9c"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Small teal dot — top-left of screen (power LED feel) */}
          <circle cx="16" cy="11" r="1.2" fill="#1abc9c" opacity="0.8" />

          {/* Small circuit trace on screen — suggests tech/diagnostic */}
          <polyline
            points="19,17 19,20 24,20 24,23 27,23"
            stroke="#1abc9c"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.55"
            fill="none"
          />
        </svg>

        {/* ── Text lockup ── */}
        <div className="tl-logo-text">
          <span className="tl-logo-name">
            Techno<span>Logs</span>
          </span>
          <span className="tl-logo-sub">Management System</span>
        </div>

      </div>
    </>
  );
}