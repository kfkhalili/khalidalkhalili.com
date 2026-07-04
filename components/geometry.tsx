/**
 * A faint, repeating eight-pointed star (khatam) — two overlapped squares, the
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
            {/* 45°-rotated square — together they read as an 8-point star */}
            <polygon points="32,8 56,32 32,56 8,32" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
