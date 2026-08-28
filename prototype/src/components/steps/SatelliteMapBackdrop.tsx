interface SatelliteMapBackdropProps {
  /** Unique prefix so SVG filter/pattern ids do not collide across maps */
  idPrefix: string;
}

/** Schematic aerial/satellite scenery for prototype maps. */
export function SatelliteMapBackdrop({ idPrefix }: SatelliteMapBackdropProps) {
  const noiseId = `${idPrefix}-sat-noise`;
  const grainId = `${idPrefix}-sat-grain`;
  const canopyId = `${idPrefix}-sat-canopy`;

  return (
    <>
      <defs>
        <filter id={noiseId} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="7" result="n" />
          <feColorMatrix
            in="n"
            type="matrix"
            values="0 0 0 0 0.18
                    0 0 0 0 0.22
                    0 0 0 0 0.14
                    0 0 0 0.55 0"
          />
        </filter>
        <filter id={grainId} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.18" numOctaves="3" seed="3" result="t" />
          <feDisplacementMap in="SourceGraphic" in2="t" scale="1.4" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <radialGradient id={canopyId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3a5a2e" />
          <stop offset="70%" stopColor="#2a4222" />
          <stop offset="100%" stopColor="#1e3018" />
        </radialGradient>
      </defs>

      {/* Earth / grass mosaic */}
      <rect width="100" height="100" fill="#4a5c38" />
      <rect x="0" y="0" width="42" height="48" fill="#5a6840" />
      <rect x="38" y="8" width="62" height="36" fill="#3f5230" />
      <rect x="0" y="52" width="100" height="48" fill="#4e5a36" />
      <rect x="55" y="60" width="45" height="40" fill="#5c5238" />
      <ellipse cx="22" cy="78" rx="28" ry="16" fill="#3d4a2c" opacity="0.85" />
      <ellipse cx="78" cy="22" rx="22" ry="14" fill="#465632" opacity="0.8" />

      {/* Building rooftops */}
      <g filter={`url(#${grainId})`}>
        <rect x="6" y="8" width="16" height="11" fill="#8d8678" />
        <rect x="8" y="9" width="12" height="3" fill="#9a9384" opacity="0.7" />
        <rect x="24" y="6" width="10" height="14" fill="#7a7468" />
        <rect x="68" y="10" width="22" height="16" fill="#918a7c" />
        <rect x="70" y="12" width="8" height="5" fill="#a39b8c" opacity="0.55" />
        <rect x="82" y="18" width="6" height="6" fill="#6e685c" />
        <rect x="4" y="38" width="18" height="12" fill="#857e70" />
        <rect x="72" y="42" width="20" height="14" fill="#7e786c" />
        <rect x="74" y="44" width="7" height="4" fill="#989184" opacity="0.5" />
        <rect x="8" y="82" width="14" height="10" fill="#8a8376" />
        <rect x="78" y="78" width="16" height="12" fill="#766f64" />
      </g>
      {/* Roof shadows */}
      <rect x="22" y="19" width="16" height="1.2" fill="#2a2a24" opacity="0.28" />
      <rect x="90" y="10" width="1.4" height="16" fill="#2a2a24" opacity="0.25" />
      <rect x="92" y="42" width="1.4" height="14" fill="#2a2a24" opacity="0.25" />
      <rect x="22" y="50" width="18" height="1.2" fill="#2a2a24" opacity="0.22" />

      {/* Tree canopy clusters */}
      <ellipse cx="18" cy="28" rx="9" ry="7" fill={`url(#${canopyId})`} />
      <ellipse cx="26" cy="32" rx="6" ry="5" fill="#2f4a24" />
      <ellipse cx="48" cy="16" rx="8" ry="6" fill="#355028" />
      <ellipse cx="54" cy="20" rx="5" ry="4" fill="#2a4220" />
      <ellipse cx="88" cy="36" rx="7" ry="6" fill="#314826" />
      <ellipse cx="14" cy="62" rx="10" ry="7" fill="#2c4522" />
      <ellipse cx="38" cy="86" rx="11" ry="7" fill="#334c26" />
      <ellipse cx="62" cy="74" rx="8" ry="6" fill="#2a4020" />
      <ellipse cx="90" cy="68" rx="6" ry="5" fill="#36522a" />

      {/* Parking / pavement */}
      <rect x="40" y="40" width="22" height="16" fill="#5a5850" opacity="0.92" />
      <path
        d="M 42 44 H 60 M 42 48 H 60 M 42 52 H 60"
        stroke="#6e6b62"
        strokeWidth="0.35"
        opacity="0.7"
      />

      {/* Asphalt roads */}
      <path
        d="M 12 18 L 88 12"
        stroke="#4e4c46"
        strokeWidth="3.2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 6 42 L 94 38"
        stroke="#53514b"
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M 20 0 L 24 100" stroke="#4a4842" strokeWidth="2.8" fill="none" />
      <path
        d="M 12 18 L 88 12"
        stroke="#6a675e"
        strokeWidth="0.35"
        strokeDasharray="1.6 1.4"
        opacity="0.7"
      />
      <path
        d="M 20 0 L 24 100"
        stroke="#6a675e"
        strokeWidth="0.3"
        strokeDasharray="1.4 1.6"
        opacity="0.55"
      />

      {/* Water */}
      <path
        d="M 0 74 C 18 70, 28 78, 42 75 S 68 69, 100 73 L 100 100 L 0 100 Z"
        fill="#2d4e58"
        opacity="0.88"
      />
      <path
        d="M 0 78 C 22 76, 40 82, 58 78 S 82 74, 100 77"
        fill="none"
        stroke="#4a6e78"
        strokeWidth="0.4"
        opacity="0.4"
      />

      {/* Satellite grain overlay */}
      <rect width="100" height="100" filter={`url(#${noiseId})`} opacity="0.28" />
    </>
  );
}
