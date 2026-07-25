/**
 * Ilustración del hero: un estante con cajas etiquetadas y una etiqueta de
 * stock flotante. Es SVG puro y usa los tokens del tema, así que se adapta a
 * claro/oscuro sin cargar ningún archivo.
 */
export function HeroArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 380"
      fill="none"
      role="img"
      aria-label="Estante con cajas de inventario y una etiqueta de stock disponible"
      className={className}
    >
      <defs>
        <linearGradient id="ha-box-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--accent-strong)" />
        </linearGradient>
        <linearGradient id="ha-box-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--accent-strong)" />
        </linearGradient>
        <linearGradient id="ha-shelf" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--border-strong)" />
          <stop offset="100%" stopColor="var(--border)" />
        </linearGradient>
        <linearGradient id="ha-halo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--teal)" stopOpacity="0.12" />
        </linearGradient>
      </defs>

      {/* halo de fondo */}
      <circle cx="210" cy="180" r="165" fill="url(#ha-halo)" />

      {/* estante */}
      <g stroke="url(#ha-shelf)" strokeWidth="7" strokeLinecap="round">
        <line x1="55" y1="200" x2="365" y2="200" />
        <line x1="55" y1="318" x2="365" y2="318" />
        <line x1="72" y1="200" x2="72" y2="340" />
        <line x1="348" y1="200" x2="348" y2="340" />
      </g>

      {/* cajas del estante superior */}
      <g>
        <rect x="92" y="128" width="78" height="72" rx="8" fill="url(#ha-box-a)" />
        <rect x="92" y="128" width="78" height="22" rx="8" fill="var(--foreground)" opacity="0.12" />
        <line x1="131" y1="128" x2="131" y2="200" stroke="var(--foreground)" strokeOpacity="0.18" strokeWidth="3" />

        <rect x="184" y="150" width="62" height="50" rx="8" fill="var(--teal)" />
        <line x1="215" y1="150" x2="215" y2="200" stroke="var(--foreground)" strokeOpacity="0.16" strokeWidth="3" />

        <rect x="260" y="112" width="72" height="88" rx="8" fill="url(#ha-box-b)" />
        <line x1="296" y1="112" x2="296" y2="200" stroke="var(--background)" strokeOpacity="0.25" strokeWidth="3" />
      </g>

      {/* cajas del estante inferior */}
      <g>
        <rect x="98" y="256" width="66" height="62" rx="8" fill="var(--primary)" opacity="0.85" />
        <line x1="131" y1="256" x2="131" y2="318" stroke="var(--background)" strokeOpacity="0.22" strokeWidth="3" />

        <rect x="180" y="240" width="80" height="78" rx="8" fill="url(#ha-box-a)" />
        <line x1="220" y1="240" x2="220" y2="318" stroke="var(--foreground)" strokeOpacity="0.18" strokeWidth="3" />

        <rect x="276" y="268" width="56" height="50" rx="8" fill="var(--teal)" opacity="0.75" />
      </g>

      {/* etiqueta flotante de stock */}
      <g className="animate-float">
        <rect
          x="238"
          y="36"
          width="150"
          height="62"
          rx="14"
          fill="var(--card)"
          stroke="var(--border-strong)"
          strokeWidth="2"
        />
        <circle cx="266" cy="67" r="13" fill="var(--teal)" opacity="0.18" />
        <path
          d="M260 67l4.5 4.5L273 62"
          stroke="var(--teal)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="288" y="53" width="76" height="8" rx="4" fill="var(--foreground)" opacity="0.75" />
        <rect x="288" y="70" width="50" height="7" rx="3.5" fill="var(--muted-foreground)" opacity="0.6" />
      </g>

      {/* etiqueta de precio */}
      <g className="animate-float" style={{ animationDelay: "1.6s" }}>
        <rect
          x="34"
          y="96"
          width="86"
          height="46"
          rx="12"
          fill="var(--card)"
          stroke="var(--border-strong)"
          strokeWidth="2"
        />
        <circle cx="55" cy="119" r="7" fill="var(--accent)" />
        <rect x="70" y="112" width="34" height="7" rx="3.5" fill="var(--foreground)" opacity="0.75" />
        <rect x="70" y="125" width="22" height="6" rx="3" fill="var(--muted-foreground)" opacity="0.55" />
      </g>
    </svg>
  )
}
