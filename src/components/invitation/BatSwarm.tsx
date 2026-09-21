import { Suspense, lazy, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";

const Lottie = lazy(() => import("lottie-react").then((m) => ({ default: m.Lottie })));

// Pre-defined deterministic configs so the swarm renders the same on
// every reload (no hydration jitter, no SSR/CSR randomness).
type BatConfig = {
  startX: number; // percent of viewport width
  amplitude: number; // px, lateral swing of the sinusoidal path
  period: number; // s, how long one full S-curve takes
  delay: number; // s before takeoff
  mirror: boolean; // flip horizontally
  duration: number; // total flight duration in s
  scale: number; // size multiplier
};

const SWARM: BatConfig[] = [
  // Wave 1 — the original five (lead the formation)
  { startX: 18, amplitude: 80, period: 1.6, delay: 0.0, mirror: false, duration: 2.4, scale: 0.6 },
  { startX: 42, amplitude: 110, period: 1.9, delay: 0.15, mirror: true, duration: 2.6, scale: 0.8 },
  { startX: 65, amplitude: 70, period: 1.4, delay: 0.3, mirror: false, duration: 2.2, scale: 0.55 },
  { startX: 82, amplitude: 95, period: 1.7, delay: 0.05, mirror: true, duration: 2.5, scale: 0.7 },
  { startX: 30, amplitude: 60, period: 2.0, delay: 0.4, mirror: false, duration: 2.7, scale: 0.5 },
  // Wave 2 — fill in the gaps left by wave 1
  { startX: 8, amplitude: 55, period: 1.5, delay: 0.55, mirror: false, duration: 2.3, scale: 0.45 },
  { startX: 25, amplitude: 90, period: 1.8, delay: 0.6, mirror: true, duration: 2.5, scale: 0.65 },
  { startX: 50, amplitude: 75, period: 1.6, delay: 0.5, mirror: false, duration: 2.4, scale: 0.55 },
  { startX: 58, amplitude: 105, period: 2.1, delay: 0.7, mirror: true, duration: 2.8, scale: 0.75 },
  { startX: 75, amplitude: 65, period: 1.5, delay: 0.45, mirror: false, duration: 2.3, scale: 0.5 },
  { startX: 92, amplitude: 85, period: 1.9, delay: 0.65, mirror: true, duration: 2.6, scale: 0.6 },
  // Wave 3 — stragglers, smaller and slower (tail of the swarm)
  { startX: 12, amplitude: 50, period: 1.4, delay: 0.9, mirror: false, duration: 2.9, scale: 0.4 },
  { startX: 35, amplitude: 70, period: 1.7, delay: 1.0, mirror: true, duration: 3.0, scale: 0.45 },
  { startX: 48, amplitude: 55, period: 1.5, delay: 0.85, mirror: false, duration: 2.7, scale: 0.4 },
  { startX: 70, amplitude: 80, period: 2.0, delay: 1.1, mirror: true, duration: 3.1, scale: 0.5 },
  {
    startX: 88,
    amplitude: 60,
    period: 1.6,
    delay: 0.95,
    mirror: false,
    duration: 2.8,
    scale: 0.42,
  },
  // Wave 4 — late strays from the edges (catch the eye after the main burst)
  { startX: 5, amplitude: 40, period: 1.3, delay: 1.3, mirror: false, duration: 3.2, scale: 0.38 },
  { startX: 22, amplitude: 55, period: 1.5, delay: 1.4, mirror: true, duration: 3.3, scale: 0.4 },
  { startX: 55, amplitude: 65, period: 1.8, delay: 1.5, mirror: false, duration: 3.4, scale: 0.45 },
  { startX: 78, amplitude: 50, period: 1.4, delay: 1.25, mirror: true, duration: 3.0, scale: 0.38 },
  { startX: 95, amplitude: 45, period: 1.3, delay: 1.35, mirror: false, duration: 3.1, scale: 0.4 },
];

type BatSwarmProps = {
  active: boolean;
  onComplete?: () => void;
};

/**
 * Twenty bats flying upward in a sinusoidal arc when `active` flips
 * true. Used as the entry flourish on the landing page — runs once
 * when the guest opens the closed carta, alongside the som-morcego.mp3
 * SFX.
 *
 * The flock is split into four staggered waves (5+6+5+4) so the burst
 * doesn't arrive all at once — front bats lead, stragglers trail for
 * ~1.5s. Each bat has its own delay / period / amplitude so the
 * formation never looks like a row of identical arcs.
 *
 * Each bat:
 *   - starts at the bottom of the viewport (100vh) at a randomised X
 *   - follows a sinusoidal X curve with its own amplitude/period
 *   - rotates to follow the tangent of the curve (a real bat banks
 *     as it turns) plus a small wobble matching the wing flap
 *   - scales up as it gets closer to the camera (perspective)
 *   - fades in fast and out at the top (last 20%)
 *
 * Motion owns the path, the Lottie player owns the wing flap (independent
 * loops inside the JSON). Lazy-loaded via Suspense so the ~12KB JSON
 * and lottie-web (~250KB) don't hit the initial bundle — they only
 * matter once the guest has clicked.
 */
export function BatSwarm({ active, onComplete }: BatSwarmProps) {
  const reduced = useReducedMotion();
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Track completion across all bats so we fire onComplete once,
  // when the slowest one finishes its flight.
  const finishedRef = useRef(0);

  useEffect(() => {
    if (!active) {
      finishedRef.current = 0;
    }
  }, [active]);

  if (!active) return null;

  // Reduced-motion: skip the swarm entirely (the SFX alone is enough
  // spooky). One path that returns null.
  if (reduced) {
    return null;
  }

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
      {SWARM.map((cfg, i) => (
        <SingleBat
          key={i}
          cfg={cfg}
          onDone={() => {
            finishedRef.current += 1;
            if (finishedRef.current === SWARM.length) {
              onCompleteRef.current?.();
            }
          }}
        />
      ))}
    </div>
  );
}

function SingleBat({ cfg, onDone }: { cfg: BatConfig; onDone: () => void }) {
  // Sinusoidal X keyframes: start at startX, swing ±amplitude, settle
  // at startX + finalX at the top. We sample 8 frames along the flight
  // so the curve looks smooth at 60fps without paying for 60 keyframes.
  const samples = 8;
  const xKeyframes = Array.from({ length: samples }, (_, k) => {
    const t = k / (samples - 1);
    const sin = Math.sin(t * Math.PI * (cfg.period * 2));
    const fade = 1 - t; // amplitude tapers near the top so the bat
    return Math.round(cfg.startX + sin * cfg.amplitude * fade * 10) / 10;
  });

  // Rotation: tilt toward the tangent of the curve + small wing-flap
  // wobble. Banking left/right alternates with the sine period.
  const rKeyframes = Array.from({ length: samples }, (_, k) => {
    const t = k / (samples - 1);
    const sin = Math.cos(t * Math.PI * (cfg.period * 2));
    return sin * (cfg.mirror ? -18 : 18);
  });

  // Scale: starts at cfg.scale * 0.7 (small), grows to cfg.scale * 1.4
  // (closer to camera) by the top. Motion's `scale` prop only accepts
  // flat numbers, so we collapse the 3D-style tuple to a 2D scale via
  // CSS (preserves aspect ratio for the Lottie inside).
  const sKeyframes = Array.from({ length: samples }, (_, k) => {
    const t = k / (samples - 1);
    return cfg.scale * (0.7 + t * 0.7);
  });

  // Opacity: fast fade-in, hold, fade out at the very end.
  const oKeyframes = [
    0, // 0%   invisible (prevents flash at mount)
    1, // 5%   faded in
    1, // 80%  still visible
    0, // 100% gone
  ];
  const oTimes = [0, 0.05, 0.8, 1];

  return (
    <motion.div
      className="absolute"
      style={{
        left: 0,
        top: 0,
        width: 120,
        height: 120,
        // Mirror at the Lottie level (not the container) so the wing
        // flap animation doesn't fight a CSS scaleX flip.
        transform: cfg.mirror ? "scaleX(-1)" : undefined,
      }}
      initial={{ opacity: 0, x: `${cfg.startX}vw`, y: "100vh" }}
      animate={{
        opacity: oKeyframes,
        x: xKeyframes.map((v) => `${v}vw`),
        y: ["100vh", "-30vh"],
        rotate: rKeyframes,
        scale: sKeyframes,
      }}
      transition={{
        duration: cfg.duration,
        delay: cfg.delay,
        ease: "easeOut",
        times: oTimes,
        // Sinusoidal arrays need a smooth interpolator; the default
        // linear-tween between array values produces visible kinks. A
        // cubic ease approximates the sine curve well enough at 8
        // samples per flight.
        x: { duration: cfg.duration, delay: cfg.delay, ease: "easeInOut" },
        rotate: {
          duration: cfg.duration,
          delay: cfg.delay,
          ease: "easeInOut",
        },
      }}
      onAnimationComplete={onDone}
    >
      <Suspense fallback={null}>
        <Lottie src="/Bat - Halloween.json" loop autoplay />
      </Suspense>
    </motion.div>
  );
}
