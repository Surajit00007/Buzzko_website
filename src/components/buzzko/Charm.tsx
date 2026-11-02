import { useId } from "react";
import type { Shape, Tone } from "@/data/products";

const v = (t: Tone) => `var(--${t})`;

/** Procedural glossy charm with metal ring. Swap for <img src={product.image}> when photos exist. */
export function Charm({ shape, tone, accent, className }: { shape: Shape; tone: Tone; accent: Tone; className?: string }) {
  const id = useId().replace(/:/g, "");
  const fill = `url(#g${id})`;
  const body = () => {
    switch (shape) {
      case "heart":
        return <path d="M100 178 C40 135 22 105 22 78 C22 52 42 34 64 34 C80 34 93 43 100 56 C107 43 120 34 136 34 C158 34 178 52 178 78 C178 105 160 135 100 178Z" />;
      case "flower":
        return (
          <g>
            {[0, 72, 144, 216, 288].map((a) => (
              <circle key={a} cx={100 + 44 * Math.sin((a * Math.PI) / 180)} cy={108 - 44 * Math.cos((a * Math.PI) / 180)} r="36" />
            ))}
          </g>
        );
      case "star":
        return <path d="M100 26 L122 78 L178 82 L135 117 L149 172 L100 142 L51 172 L65 117 L22 82 L78 78Z" strokeLinejoin="round" strokeWidth="18" stroke={fill} />;
      case "smiley":
      case "frame":
        return shape === "smiley" ? <circle cx="100" cy="106" r="74" /> : <rect x="34" y="40" width="132" height="140" rx="34" />;
      case "letter":
        return <path d="M52 34 H112 C142 34 160 50 160 74 C160 90 151 101 138 106 C156 111 168 125 168 145 C168 168 148 182 118 182 H52Z" />;
    }
  };
  return (
    <svg data-charm viewBox="0 0 200 200" className={className} aria-hidden="true" overflow="visible">
      <defs>
        <radialGradient id={`g${id}`} cx="35%" cy="30%" r="80%">
          <stop offset="0%" style={{ stopColor: "var(--gloss)" }} />
          <stop offset="18%" style={{ stopColor: v(tone) }} />
          <stop offset="100%" style={{ stopColor: `color-mix(in oklch, ${v(tone)} 70%, var(--ink))` }} />
        </radialGradient>
        <linearGradient id={`m${id}`} x1="0" x2="1">
          <stop offset="0%" style={{ stopColor: "var(--metal-dark)" }} />
          <stop offset="50%" style={{ stopColor: "var(--metal)" }} />
          <stop offset="100%" style={{ stopColor: "var(--metal-dark)" }} />
        </linearGradient>
      </defs>
      {/* ring + jump link */}
      <circle cx="100" cy="-6" r="20" fill="none" stroke={`url(#m${id})`} strokeWidth="6" />
      <ellipse cx="100" cy="22" rx="6" ry="11" fill="none" stroke={`url(#m${id})`} strokeWidth="5" />
      <g fill={fill}>{body()}</g>
      {/* details */}
      {shape === "flower" && <circle cx="100" cy="108" r="26" style={{ fill: v(accent) }} />}
      {shape === "smiley" && (
        <g style={{ fill: v(accent), stroke: v(accent) }}>
          <ellipse cx="76" cy="92" rx="8" ry="13" />
          <ellipse cx="124" cy="92" rx="8" ry="13" />
          <path d="M66 124 Q100 156 134 124" fill="none" strokeWidth="9" strokeLinecap="round" />
        </g>
      )}
      {shape === "frame" && <rect x="56" y="62" width="88" height="96" rx="18" style={{ fill: `color-mix(in oklch, ${v(accent)} 35%, var(--paper))` }} />}
      {shape === "frame" && <circle cx="100" cy="100" r="14" style={{ fill: v("yellow") }} />}
      {shape === "letter" && <text x="104" y="136" textAnchor="middle" fontSize="70" fontWeight="700" style={{ fill: v(accent), fontFamily: "var(--font-display)" }}>b</text>}
      {shape === "heart" && <circle cx="140" cy="62" r="10" style={{ fill: v(accent) }} />}
      {shape === "star" && <circle cx="100" cy="106" r="16" style={{ fill: v(accent) }} />}
      {/* specular streak */}
      <ellipse cx="72" cy="66" rx="18" ry="8" transform="rotate(-30 72 66)" style={{ fill: "var(--gloss)" }} opacity="0.55" />
    </svg>
  );
}
