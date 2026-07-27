export function LogoMark({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Maaz Bin Tariq Online Quran Academy emblem"
    >
      <circle cx="32" cy="32" r="31" fill="#064E3B" />
      <circle cx="32" cy="32" r="31" fill="none" stroke="#D97706" strokeWidth="1.5" />
      {/* 8-point Islamic star (rub el hizb) built from two overlapping squares */}
      <g transform="translate(32,32)">
        <rect
          x="-16"
          y="-16"
          width="32"
          height="32"
          fill="none"
          stroke="#D97706"
          strokeWidth="1.6"
          transform="rotate(0)"
        />
        <rect
          x="-16"
          y="-16"
          width="32"
          height="32"
          fill="none"
          stroke="#FDFBF7"
          strokeWidth="1.2"
          transform="rotate(45)"
        />
      </g>
      {/* Central crescent + open book motif */}
      <path
        d="M32 20c-6.5 0-11.5 5.2-11.5 12S25.5 44 32 44c3 0 5.7-1.1 7.8-2.9-1.4.5-2.9.8-4.5.8-6 0-10.8-4.9-10.8-10.9S29.3 20.1 35.3 20.1c1.6 0 3.1.3 4.5.8C37.7 19 35 18 32 20z"
        fill="#D97706"
        opacity="0"
      />
      <g transform="translate(32,33)" fill="#FDFBF7">
        <path d="M-10 6c0-7 5-11 10-11-4.3 1.6-7 5.7-7 10.5S-4.3 15.9 0 17.5C-5 17.5-10 13 -10 6z" />
        <circle cx="6" cy="-6" r="1.4" fill="#D97706" />
      </g>
    </svg>
  );
}

export function LogoLockup({ withTagline = true }: { withTagline?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <LogoMark size={44} />
      <div className="leading-tight">
        <p className="font-display text-ivory text-lg sm:text-xl tracking-wide">
          Maaz Bin Tariq
        </p>
        <p className="text-gold text-[11px] sm:text-xs tracking-[0.2em] uppercase">
          Online Quran Academy
        </p>
      </div>
    </div>
  );
}
