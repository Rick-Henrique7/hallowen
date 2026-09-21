import { Suspense, lazy } from "react";
import { motion, useReducedMotion } from "motion/react";

const Lottie = lazy(() => import("lottie-react").then((m) => ({ default: m.Lottie })));

type PumpkinConfig = {
  startX: number; // percent of viewport width
  endX: number; // percent of viewport width at the top
  amplitude: number; // px, lateral swing
  period: number; // s, sine period
  delay: number; // s before takeoff
  duration: number; // s, total flight
  scale: number; // size multiplier
  rotateAmount: number; // degrees of gentle bank
};

// Two pumpkins, deliberately routed outside the centre column where
// the carta/convite lives. Pumpkin A launches bottom-left and rises
// to upper-left; Pumpkin B mirrors from bottom-right to upper-right.
// Their lateral X swing never crosses x=50% so they never occlude the
// carta or the convite.
const PUMPKINS: PumpkinConfig[] = [
  {
    startX: 6,
    endX: 14,
    amplitude: 70,
    period: 1.6,
    delay: 0.4,
    duration: 2.6,
    scale: 0.18,
    rotateAmount: 18,
  },
  {
    startX: 94,
    endX: 86,
    amplitude: 70,
    period: 1.6,
    delay: 0.6,
    duration: 2.6,
    scale: 0.18,
    rotateAmount: 18,
  },
];

type FlyingPumpkinsProps = {
  active: boolean;
};

/**
 * Two cute pumpkins flying upward off the bottom corners of the
 * viewport. Triggered by the same `active` flag as the bat swarm —
 * the user clicks the closed carta, and on click both effects
 * launch together.
 *
 * They follow the same Motion-driven sinusoidal arc pattern as the
 * bats (started, endX drift, gentle rotation banking into the turn)
 * but the paths are intentionally pinned to the screen edges
 * (startX + endX either both < 15% or both > 85%), so neither
 * pumpkin ever crosses the central column where the carta and the
 * convite sit.
 *
 * Like the bats this component is decorative and lazy-loads
 * lottie-react + the JSON together, keeping them off the initial
 * bundle.
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
  const samples = 8;

  // X: lerp from startX at bottom to endX at top, with a sine
  // oscillation overlaid (each pumpkin has its own period so they
  // don't curve in lockstep).
  const xKeyframes = Array.from({ length: samples }, (_, k) => {
    const t = k / (samples - 1);
    const linear = cfg.startX + (cfg.endX - cfg.startX) * t;
    const sin = Math.sin(t * Math.PI * (cfg.period * 2));
    const fade = 1 - t;
    return Math.round((linear + sin * cfg.amplitude * fade * 0.05) * 10) / 10;
  });

  // Rotation banks gently in the direction of the turn. Negative
  // because pumpkin B is on the right and banks the other way.
  const rKeyframes = Array.from({ length: samples }, (_, k) => {
    const t = k / (samples - 1);
    return -Math.sin(t * Math.PI * cfg.period) * cfg.rotateAmount;
  });

  // Scale: small to slightly larger (perspective — looks like the
  // pumpkin climbs toward camera).
  const sKeyframes = Array.from({ length: samples }, (_, k) => {
    const t = k / (samples - 1);
    return cfg.scale * (0.85 + t * 0.3);
  });

  const oKeyframes = [0, 1, 1, 0];
  const oTimes = [0, 0.08, 0.8, 1];

  // The asset is 2160x2160; we scale the rendered box down so a
  // scale:0.18 reads as a small floating pumpkin.
  return (
    <motion.div
      className="absolute"
      style={{ left: 0, top: 0, width: 200, height: 200 }}
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
        x: { duration: cfg.duration, delay: cfg.delay, ease: "easeInOut" },
        rotate: {
          duration: cfg.duration,
          delay: cfg.delay,
          ease: "easeInOut",
        },
      }}
    >
      <Suspense fallback={null}>
        <Lottie src="/Cute Halloween flying pumpkin.json" loop autoplay />
      </Suspense>
    </motion.div>
  );
}
