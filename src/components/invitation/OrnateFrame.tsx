const EDGE_H = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="24" viewBox="0 0 60 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M0 12h8"/><path d="M8 12c4-8 12-8 14 0s10 8 14 0 12-8 16 0"/><path d="M52 12h8"/><circle cx="30" cy="5" r="1.6" fill="currentColor" stroke="none"/></svg>`,
);

const EDGE_V = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="60" viewBox="0 0 24 60" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M12 0v8"/><path d="M12 8c-8 4-8 12 0 14s8 10 0 14 -8 12 0 16"/><path d="M12 52v8"/><circle cx="5" cy="30" r="1.6" fill="currentColor" stroke="none"/></svg>`,
);

function Corner({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 72 72"
      className={`absolute h-12 w-12 text-ink/70 sm:h-[72px] sm:w-[72px] ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 68V22C4 12 12 4 22 4h46" />
      <path d="M10 68V24c0-8 6-14 14-14h44" opacity="0.55" />
      <path d="M18 40c0-10 8-18 18-18 8 0 12 5 12 10s-4 9-9 9-8-3-8-7" />
      <path d="M24 62c8 0 14-5 14-12" opacity="0.7" />
      <circle cx="48" cy="24" r="2.2" fill="currentColor" stroke="none" />
      {/* small bat */}
      <path
        d="M50 52c3-4 5-2 6 0 1-2 3-4 6 0-2 0-3 1-3 3-1-1-2-1-3 0-1-1-2-1-3 0 0-2-1-3-3-3Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

/**
 * 9-slice ornate frame: fixed-size SVG corners + repeating SVG edges,
 * so nothing stretches or blurs at any viewport width.
 */
export function OrnateFrame() {
  return (
    <div className="pointer-events-none absolute inset-0 text-ink/70">
      <div className="absolute inset-2 rounded-[2px] border border-ink/35 sm:inset-3" />
      <div className="absolute inset-[10px] rounded-[2px] border border-ink/20 sm:inset-4" />

      {/* edges */}
      <div
        className="absolute top-0 right-12 left-12 h-6 opacity-70 sm:right-[72px] sm:left-[72px]"
        style={{
          backgroundImage: `url("data:image/svg+xml,${EDGE_H}")`,
          backgroundRepeat: "repeat-x",
          backgroundPosition: "center",
        }}
      />
      <div
        className="absolute right-12 bottom-0 left-12 h-6 rotate-180 opacity-70 sm:right-[72px] sm:left-[72px]"
        style={{
          backgroundImage: `url("data:image/svg+xml,${EDGE_H}")`,
          backgroundRepeat: "repeat-x",
          backgroundPosition: "center",
        }}
      />
      <div
        className="absolute top-12 bottom-12 left-0 w-6 opacity-70 sm:top-[72px] sm:bottom-[72px]"
        style={{
          backgroundImage: `url("data:image/svg+xml,${EDGE_V}")`,
          backgroundRepeat: "repeat-y",
          backgroundPosition: "center",
        }}
      />
      <div
        className="absolute top-12 right-0 bottom-12 w-6 rotate-180 opacity-70 sm:top-[72px] sm:bottom-[72px]"
        style={{
          backgroundImage: `url("data:image/svg+xml,${EDGE_V}")`,
          backgroundRepeat: "repeat-y",
          backgroundPosition: "center",
        }}
      />

      {/* corners */}
      <Corner className="top-0 left-0" />
      <Corner className="top-0 right-0 scale-x-[-1]" />
      <Corner className="bottom-0 left-0 scale-y-[-1]" />
      <Corner className="right-0 bottom-0 scale-[-1]" />
    </div>
  );
}
