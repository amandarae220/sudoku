// Line-icon set. Each icon inherits currentColor and is decorative
// (aria-hidden); the surrounding control carries the accessible name.
import React from "react";

type IconProps = { className?: string };

const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

export const ClockIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </svg>
);

export const TrophyIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
    <path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3" />
    <path d="M12 13v4M9 21h6M10 21v-2h4v2" />
  </svg>
);

export const BulbIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <path d="M9 18h6M10 21h4" />
    <path d="M12 3a6 6 0 0 0-4 10.5c.7.8 1 1.3 1 2.5h6c0-1.2.3-1.7 1-2.5A6 6 0 0 0 12 3Z" />
  </svg>
);

export const ChevronIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const BarsIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <path d="M5 20V10M12 20V4M19 20v-6" />
  </svg>
);

export const HelpIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9a2.5 2.5 0 0 1 4.5 1.5c0 1.5-2 2-2 3M12 17h.01" />
  </svg>
);

export const CellIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M12 9v6M9 12h6" />
  </svg>
);

export const KeyboardIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <path d="M7 10h.01M11 10h.01M15 10h.01M8 14h8" />
  </svg>
);

export const EraserIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <path d="M4 15.5 11.5 8l5 5L11 18.5H7.5L4 15.5Z" />
    <path d="M11.5 8l3-3a1.5 1.5 0 0 1 2 0l3 3a1.5 1.5 0 0 1 0 2l-3 3M8 21h12" />
  </svg>
);

export const SunIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

export const MoonIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <path d="M21 12.8A8 8 0 1 1 11.2 3a6 6 0 0 0 9.8 9.8Z" />
  </svg>
);
