export default function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-label="Playra">
      <defs>
        <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.4" floodOpacity="0.4" />
        </filter>
      </defs>
      <g filter="url(#logoShadow)">
        <path
          d="M22 14 H56 A22 22 0 0 1 56 58 H40 V86 H22 Z"
          fill="#F4EFE6"
          stroke="#F4EFE6"
          strokeWidth="14"
          strokeLinejoin="round"
        />
        <path d="M22 14 H56 A22 22 0 0 1 56 58 H40 V86 H22 Z" fill="#8B6BFF" />
        <rect x="28" y="22" width="3" height="14" rx="1.5" fill="#fff" opacity="0.45" />
      </g>
    </svg>
  )
}
