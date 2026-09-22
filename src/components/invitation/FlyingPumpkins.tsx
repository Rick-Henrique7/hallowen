import { Suspense, lazy } from "react";
import { motion, useReducedMotion } from "motion/react";

const Lottie = lazy(() => import("lottie-react").then((m) => ({ default: m.Lottie })));

type PumpkinConfig = {
  // Travel axis — the pumpkin enters and exits OFF-SCREEN, so the
  // continuous loop never produces a visible teleport.
  //
  // startX/startY = where the pumpkin appears (off-screen)
  // endX/endY = where it disappears (off-screen, opposite side)
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

// Pumpkin A: travels from bottom-left (off-screen) to upper-right
// (off-screen). The path crosses the bottom-left third of the
// viewport before exiting through the top edge.
//
// Pumpkin B: travels from top-right (off-screen) to lower-left
// (off-screen). Crosses the upper-right third before exiting
// through the bottom edge.
//
// Both anchor positions are off-screen (negative or >100) so the
// continuous loop never produces a visible teleport: the pumpkin
// appears outside, crosses the viewport, and disappears outside.
// Each one repeats every `duration` seconds forever.
const PUMPKINS: PumpkinConfig[] = [
  {
    startX: -8,
    startY: 105,
    endX: 50,
    endY: -15,
    amplitude: 80,
    period: 1.7,
    size: 180,
    face: "right",
    delay: 0,
    duration: 8,
  },
  {
    startX: 108,
    startY: -5,
    endX: 50,
    endY: 115,
    amplitude: 90,
    period: 1.9,
    size: 180,
    face: "left",
    delay: 4,
    duration: 8.5,
  },
];

type FlyingPumpkinsProps = {
  active: boolean;
};

/**
 * Two cute pumpkins flying slowly along diagonal arcs, looping
 * forever while `active` is true.
 *
 * Implementation: each pumpkin's outer <motion.div> uses
 * `repeat: Infinity` on the timeline. The keyframes walk
 * startX/startY -> endX/endY over `duration` seconds, then
 * instantly loop back. Because both endpoints are off-screen
 * (negative or >100 on the relevant axis), the loop's reset is
 * invisible to the viewer — the pumpkin appears to enter from
 * off-screen, cross the viewport, and exit on the other side,
 * with another one entering right behind it.
 *
 * Design notes:
 *   - Slow (~8s per flight), per request
 *   - Sinusoidal lateral swing overlaid on the linear travel via
 *     a child <motion.div> (separate transform tracks so Motion
 *     doesn't fight itself)
 *   - Wings flap independently inside the Lottie player
 *   - paths avoid the carta/convite column in the centre:
 *     Pumpkin A crosses the bottom-left third; Pumpkin B crosses
 *     the upper-right third. They never overlap each other or
 *     the central column at the same time.
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
  const times = Array.from({ length: samples }, (_, k) => k / (samples - 1));

  const xKeyframes = times.map((t) => cfg.startX + (cfg.endX - cfg.startX) * t);
  const yKeyframes = times.map((t) => cfg.startY + (cfg.endY - cfg.startY) * t);

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

  const rKeyframes: number[] = times.map((t) => {
    const cos = Math.cos(t * Math.PI * cfg.period * 2);
    const taper = Math.sin(t * Math.PI);
    return Math.round(cos * 12 * taper * (cfg.face === "left" ? -1 : 1));
  });

  return (
    <motion.div
      className="absolute"
      style={{
        left: 0,
        top: 0,
        width: cfg.size,
        height: cfg.size,
      }}
      animate={{
        x: xKeyframes.map((v) => `${v}vw`),
        y: yKeyframes.map((v) => `${v}vh`),
        rotate: rKeyframes,
      }}
      transition={{
        duration: cfg.duration,
        delay: cfg.delay,
        ease: "linear",
        times,
        repeat: Infinity,
        repeatType: "loop",
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
          repeat: Infinity,
          repeatType: "loop",
        }}
      >
        <Suspense fallback={null}>
          <Lottie src="/Cute Halloween flying pumpkin.json" loop autoplay />
        </Suspense>
      </motion.div>
    </motion.div>
  );
}
