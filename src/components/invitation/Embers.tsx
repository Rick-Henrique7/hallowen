const SPECKS = [
  { left: "8%", size: 4, delay: 0, duration: 14 },
  { left: "21%", size: 3, delay: 3, duration: 18 },
  { left: "34%", size: 5, delay: 6, duration: 12 },
  { left: "48%", size: 3, delay: 1.5, duration: 16 },
  { left: "61%", size: 4, delay: 8, duration: 15 },
  { left: "74%", size: 6, delay: 4.5, duration: 19 },
  { left: "88%", size: 3, delay: 2.2, duration: 13 },
  { left: "96%", size: 4, delay: 7.5, duration: 17 },
];

export function Embers() {
  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden" aria-hidden="true">
      {SPECKS.map((s) => (
        <span
          key={s.left}
          className="ember-speck absolute bottom-0 rounded-full bg-ember"
          style={{
            left: s.left,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            boxShadow: "0 0 10px 2px color-mix(in oklab, var(--ember) 60%, transparent)",
          }}
        />
      ))}
    </div>
  );
}
