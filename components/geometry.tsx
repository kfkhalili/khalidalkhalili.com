/**
 * Rub el Hizb (۞): the eight-pointed star with a center circle. Rendered as a
 * fixed, full-page wallpaper in both themes. Light needs a touch more opacity
 * than dark for the same perceived faintness. Sits behind all content.
 */
export function RubHizbBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 text-accent opacity-[0.08] dark:opacity-[0.05]"
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
