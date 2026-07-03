import React from 'react';

interface Props {
  size?: number;
  className?: string;
}

/**
 * ConstructMark — Geometric brand mark for ConstructOS
 *
 * Design language:
 * - Hexagon outer ring → engineering precision & structural integrity
 * - Interlocking inner layers → milestones / event sourcing
 * - Upward central pillar → capital flow & project completion
 *
 * Color treatment (no gradients, pure SVG):
 * - Outer ring: primary blue (#356DFF)
 * - Inner geometry: cyan accent (#22D3EE)
 * - Capital flow highlight: gold (#FACC15)
 */
export const ConstructMark: React.FC<Props> = ({ size = 28, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={className}
  >
    {/* Hexagon outer ring — engineering & structure */}
    <path
      d="M16 1.5L28.5 8.75V23.25L16 30.5L3.5 23.25V8.75L16 1.5Z"
      stroke="#356DFF"
      strokeWidth="1.5"
      fill="none"
    />

    {/* Interlocking layers — milestones / event sourcing */}
    {/* Bottom layer (widest) */}
    <path
      d="M10 22L16 18.5L22 22L22 19L16 15.5L10 19Z"
      fill="#22D3EE"
      opacity="0.5"
    />
    {/* Middle layer */}
    <path
      d="M10 18L16 14.5L22 18L22 15L16 11.5L10 15Z"
      fill="#22D3EE"
      opacity="0.75"
    />

    {/* Upward central pillar — capital flow & completion */}
    <path
      d="M13 14L16 6L19 14L16 12Z"
      fill="#FACC15"
    />

    {/* Top cap on the pillar */}
    <path
      d="M14.5 7.5L16 4.5L17.5 7.5L16 8.5Z"
      fill="#FACC15"
    />

    {/* Connecting lines from layers to pillar base */}
    <line x1="16" y1="12" x2="10" y2="15" stroke="#22D3EE" strokeWidth="0.75" opacity="0.6" />
    <line x1="16" y1="12" x2="22" y2="15" stroke="#22D3EE" strokeWidth="0.75" opacity="0.6" />
  </svg>
);