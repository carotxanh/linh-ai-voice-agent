/**
 * Minimalist line-art icons for industries (white on dark tiles).
 * All use currentColor so they inherit text/icon color.
 */
const stroke = 1.8
const viewBox = '0 0 24 24'

const icons = {
  telecom: (
    <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  energy: (
    <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  automotive: (
    <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H8.24a1 1 0 0 0-.8.4L4.84 11l-5.16.86a1 1 0 0 0-.84.99V16h3" />
      <path d="M17 5H7l2 4h4l2-4z" />
    </svg>
  ),
  chemicals: (
    <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2v7.31" />
      <path d="M14 9.3V2" />
      <path d="M8.5 2h7" />
      <path d="M14 21v-5.5" />
      <path d="M10 15.5V21" />
      <path d="M8.5 21h7" />
      <path d="M12 9.3v6.2" />
      <path d="M4 12h16" />
    </svg>
  ),
  consulting: (
    <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  media: (
    <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
      <path d="M17 2l-5 5-2-2-7 7" />
    </svg>
  ),
  sports: (
    <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L15 8.5l6 .5-4.5 4 1.5 6L12 17l-6 2 1.5-6L3 9l6-.5L12 2z" />
    </svg>
  ),
  beauty: (
    <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  ),
  healthcare: (
    <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  pharma: (
    <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 4h4v6l4 2-4 2v6h-4v-6l-4-2 4-2V4z" />
    </svg>
  ),
  services: (
    <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M4.93 4.93l2.83 2.83" />
      <path d="M16.24 16.24l2.83 2.83" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
      <path d="M4.93 19.07l2.83-2.83" />
      <path d="M16.24 7.76l2.83-2.83" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  law: (
    <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18" />
      <path d="M8 12h8" />
      <path d="m10 8-2 4 2 4" />
      <path d="m14 8 2 4-2 4" />
    </svg>
  ),
  retail: (
    <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  banking: (
    <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18" />
      <path d="M3 10h18" />
      <path d="M5 6l7-3 7 3" />
      <path d="M4 10v11" />
      <path d="M20 10v11" />
      <path d="M8 14v0" />
      <path d="M12 14v0" />
      <path d="M16 14v0" />
    </svg>
  ),
  manufacturing: (
    <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20h20" />
      <path d="M5 20V8l7-4 7 4v12" />
      <path d="M9 20v-6h6v6" />
    </svg>
  ),
  construction: (
    <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20h20" />
      <path d="M5 20V10l7.5-5L20 10v10" />
      <path d="M9 20v-5h6v5" />
    </svg>
  ),
  logistics: (
    <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.27 6.96L12 12.01l8.73-5.05" />
      <path d="M12 22.08V12" />
    </svg>
  ),
  textile: (
    <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a2 2 0 0 0 1.99 1.68h13.5a2 2 0 0 0 2-1.68l.58-3.47a2 2 0 0 0-1.35-2.23z" />
      <path d="M12 9v13" />
      <path d="M8 22h8" />
    </svg>
  ),
  food: (
    <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8z" />
      <path d="M6 1v3" />
      <path d="M10 1v3" />
      <path d="M14 1v3" />
    </svg>
  ),
  realestate: (
    <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22V12h6v10" />
    </svg>
  ),
  finance: (
    <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  environment: (
    <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22v-4" />
      <path d="M12 18c-3-2-5-5-5-8 0-4 3-7 5-7s5 3 5 7c0 3-2 6-5 8z" />
    </svg>
  ),
  fashion: (
    <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16v16H4z" />
      <path d="M4 8h16" />
      <path d="M9 4v16" />
    </svg>
  ),
  electronics: (
    <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="14" rx="2" ry="2" />
      <path d="M2 14h20" />
      <path d="M16 18h.01" />
    </svg>
  ),
  transport: (
    <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 3h15v13H1z" />
      <path d="M16 8h5l3 3v3h-8V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  marketing: (
    <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M18 9l-5 5-4-4-6 6" />
      <path d="M13 9h5v5" />
    </svg>
  ),
  accounting: (
    <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M8 6h8" />
      <path d="M8 10h8" />
      <path d="M8 14h4" />
    </svg>
  ),
  hotel: (
    <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22V12h6v10" />
      <path d="M9 12h6" />
    </svg>
  ),
}

export function IndustryIcon({ name, className = '' }) {
  const Icon = icons[name]
  if (!Icon) return null
  return (
    <span className={`industry-icon-svg ${className}`} aria-hidden>
      {Icon}
    </span>
  )
}

export default IndustryIcon
