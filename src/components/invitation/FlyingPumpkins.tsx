import { Suspense, lazy } from "react";
import { motion, useReducedMotion } from "motion/react";

const Lottie = lazy(() => import("lottie-react").then((m) => ({ default: m.Lottie })));

type PumpkinConfig = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  amplitude: number;
  period: number;
  size: number;
  face: "left" | "right";
  delay: number;
  duration: number;
};

// Two pumpkins on crossing diagonal arcs. Both paths bow toward
// the screen centre so they look like they're circling the carta
// without ever crossing it.
//
// Path A: bottom-left -> top-right, curve bows upward
// Path B: top-right -> bottom-left, curve bows downward
//
// Both avoid the central carta column (28-72vw) by either staying
// below 28vw or above 72vw in their start/end anchors.
const PUMPKINS: PumpkinConfig[] = [
  {
    startX: 6,
    startY: 88,
    endX: 24,
    endY: 12,
    amplitude: 80,
    period: 1.7,
    size: 180,
    face: "right",
    delay: 0,
    duration: 7,
  },
  {
    startX: 94,
    startY: 12,
    endX: 76,
    endY: 88,
    amplitude: 90,
    period: 1.9,
    size: 180,
    face: "left",
    delay: 2.5,
    duration: 7.5,
  },
];

type FlyingPumpkinsProps = {
  active: boolean;
};

/**
 * Two cute pumpkins flying slowly across the viewport along
 * crossing diagonal arcs. Triggered by the user clicking the
 * closed carta.
 *
 * Per request: flying (not static), slow (~7s per pumpkin), curved
 * (sinusoidal lateral swing overlaid on the linear travel),
 * appearing from different directions (here: bottom-left and
 * top-right, so they cross paths in the middle).
 *
 * Two-layer transform structure:
 *   Outer <motion.div> = primary travel (x: lerp vw, y: lerp vh)
 *   Inner <motion.div> = sinusoidal swing (x: sin px, y: cos px)
 *
 * Splitting them avoids Motion fighting itself over the same
 * transform property. The wing-flap animation is independent
 * (owned by the Lottie player).
 */
export function FlyingPumpkins({ active }: FlyingPumpkinsProps) {
  if (!active) return null;
  if (useReducedMotion()) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {PUMPKINS.map((cfg, i) => (
        <SinglePumpkin key={i} cfg={cfg} />
      ))}
    </div>
  );
}

function SinglePumpkin({ cfg }: { cfg: PumpkinConfig }) {
  const samples = 16;

  // Primary path: linear lerp from start to end on both axes.
  // `times` is shared across all keyframe arrays so Motion
  // animates them in sync.
  const times = Array.from({ length: samples }, (_, k) => k / (samples - 1));
  const xKeyframes = times.map((t) => cfg.startX + (cfg.endX - cfg.startX) * t);
  const yKeyframes = times.map((t) => cfg.startY + (cfg.endY - cfg.startY) * t);

  // Secondary sine swing overlaid in a child transform track.
  // Sin is the lateral S-curve, multiplied by a sine taper so the
  // pumpkin enters and exits at zero swing (no jerk).
  const lateralX = times.map((t) => {
    const sin = Math.sin(t * Math.PI * cfg.period * 2);
    const taper = Math.sin(t * Math.PI);
    return Math.round(sin * taper * cfg.amplitude);
  });
  const lateralY = times.map((t) => {
    const cos = Math.cos(t * Math.PI * cfg.period * 2);
    const taper = Math.sin(t * Math.PI);
    return Math.round(cos * taper * cfg.amplitude * 0.5);
  });

  // Bank into the curve.
  const rKeyframes = times.map((t) => {
    const cos = Math.cos(t * Math.PI * cfg.period * 2);
    const taper = Math.sin(t * Math.PI);
    return Math.round(cos * 12 * taper * (cfg.face === "left" ? -1 : 1));
  });

  const oKeyframes = [0, 1, 1, 0];
  const oTimes = [0, 0.05, 0.85, 1];

  return (
    <motion.div
      className="absolute"
      style={{
        left: 0,
        top: 0,
        width: cfg.size,
        height: cfg.size,
      }}
      initial={{
        opacity: 0,
        x: `${xKeyframes[0]}vw`,
        y: `${yKeyframes[0]}vh`,
      }}
      animate={{
        opacity: oKeyframes,
        x: xKeyframes.map((v) => `${v}vw`),
        y: yKeyframes.map((v) => `${v}vh`),
        rotate: rKeyframes,
      }}
      transition={{
        duration: cfg.duration,
        delay: cfg.delay,
        ease: "linear",
        times,
        x: { duration: cfg.duration, delay: cfg.delay, ease: "easeInOut" },
        y: { duration: cfg.duration, delay: cfg.delay, ease: "easeInOut" },
      }}
    >
      <motion.div
        style={{
          width: cfg.size,
          height: cfg.size,
          transform: cfg.face === "left" ? "scaleX(-1)" : undefined,
        }}
        animate={{
          x: lateralX,
          y: lateralY,
        }}
        transition={{
          duration: cfg.duration,
          delay: cfg.delay,
          ease: "linear",
          times,
        }}
      >
        <Suspense fallback={null}>
          <Lottie src="/Cute Halloween flying pumpkin.json" loop autoplay />
        </Suspense>
      </motion.div>
    </motion.div>
  );
}
