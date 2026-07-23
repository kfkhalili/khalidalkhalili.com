/**
 * A faint, repeating eight-pointed star (khatam): two overlapped squares, the
 * classic seed of Islamic strapwork. Purely decorative; inherits `currentColor`
 * so callers control tint and opacity via Tailwind text-color + opacity utils.
 */
export function StarPattern({
  id = "khatam",
  className = "",
}: {
  id?: string;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      className={className}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern
          id={id}
          width="64"
          height="64"
          patternUnits="userSpaceOnUse"
          patternTransform="translate(0 0)"
        >
          <g fill="none" stroke="currentColor" strokeWidth="1">
            {/* axis-aligned square */}
            <polygon points="15,15 49,15 49,49 15,49" />
            {/* 45°-rotated square; together they read as an 8-point star */}
            <polygon points="32,8 56,32 32,56 8,32" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/**
 * Rub el Hizb (۞): the eight-pointed star with a center circle. Rendered as a
 * fixed, full-page wallpaper that appears only in dark mode; light mode has no
 * equivalent. Faint and decorative, it sits behind all content.
 */
export function RubHizbBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 hidden text-accent opacity-[0.05] dark:block"
    >
      <svg
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern
            id="rub-el-hizb"
            width="96"
            height="96"
            patternUnits="userSpaceOnUse"
          >
            <g fill="none" stroke="currentColor" strokeWidth="1">
              {/* two congruent squares, one rotated 45°: the eight-pointed star */}
              <polygon points="22.5,22.5 73.5,22.5 73.5,73.5 22.5,73.5" />
              <polygon points="48,12 84,48 48,84 12,48" />
              {/* the center circle that makes it a Rub el Hizb */}
              <circle cx="48" cy="48" r="9" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#rub-el-hizb)" />
      </svg>
    </div>
  );
}
