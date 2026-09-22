import { Suspense, lazy } from "react";
import { motion, useReducedMotion } from "motion/react";

const Lottie = lazy(() => import("lottie-react").then((m) => ({ default: m.Lottie })));

type PumpkinConfig = {
  // Where the pumpkin sits. Both are pinned to the screen edges
  // (left < 15vw, right > 85vw) so they never occlude the central
  // carta / convite column.
  x: number; // percent of viewport width
  y: number; // px from the top of the viewport
  // Width / height of the wrapping <div> in pixels. The JSON is
  // authored at 2160x2160, so we render at scale that reads as
  // a sizeable prop on screen.
  size: number;
  // Direction the pumpkin faces. "left" = startX-style facing left.
  // We mirror via scaleX(-1) so both pumpkins face toward the
  // carta in the middle of the screen.
  face: "left" | "right";
};

// Two pumpkins parked at the bottom corners of the viewport. They
// are decorative props — they do NOT move, do NOT fly, do NOT animate
// in or out. They just sit there once the carta is open, like little
// Halloween decorations.
//
// Path rationale — pinned to the screen edges so they never occlude
// the carta / convite which live in the central column:
//   Pumpkin A: 8vw from the left, near the bottom
//   Pumpkin B: 92vw from the right (mirrored horizontally), near the
//              bottom
// Carta occupies roughly 28-72vw of the viewport horizontally, so
// the pumpkins (8vw / 92vw anchors) are well clear of the carta.
const PUMPKINS: PumpkinConfig[] = [
  { x: 8, y: 0, size: 180, face: "right" },
  { x: 92, y: 0, size: 180, face: "left" },
];

type FlyingPumpkinsProps = {
  active: boolean;
};

/**
 * Two cute pumpkins sitting statically at the bottom of the
 * viewport. Triggered by the same `active` flag as the bat swarm —
 * once the user clicks the closed carta, both pumpkins appear and
 * stay put.
 *
 * This is a decorative-only pass: no path animation, no oscillation,
 * no entry/exit transitions. They render when active flips true and
 * unmount when it flips false (which happens when the user navigates
 * away — in practice, never, since this is the landing page).
 *
 * The 180px size is ~10× the previous 18-px scale; per the user's
 * request "pode aumentar o tamanho dela em 10 vezes". The Lottie
 * wrapper is sized in pixels (not vw) so the pumpkins have a
 * consistent visual size across mobile and desktop, anchored at
 * the bottom corners.
 *
 * Lazy-load via Suspense — same pattern as BatSwarm — keeps the
 * 17KB pumpkin JSON and the lottie-web bundle off the initial
 * route payload.
 */
export function FlyingPumpkins({ active }: FlyingPumpkinsProps) {
  if (!active) return null;
  if (useReducedMotion()) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex items-end justify-between px-4"
    >
      {PUMPKINS.map((cfg, i) => (
        <SinglePumpkin key={i} cfg={cfg} />
      ))}
    </div>
  );
}

function SinglePumpkin({ cfg }: { cfg: PumpkinConfig }) {
  // Animate opacity from 0 to 1 on mount so they don't pop in
  // instantly. Subtle (300ms) so it feels like they were always
  // there and just "lit up" when the carta opened.
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{
        // size is the rendered <div> footprint. The Lottie inside
        // fills it. Mirror at the wrapper level so the wing-flap
        // animation still feels natural when the pumpkin faces
        // toward the centre.
        width: cfg.size,
        height: cfg.size,
        transform: cfg.face === "left" ? "scaleX(-1)" : undefined,
      }}
    >
      <Suspense fallback={null}>
        <Lottie src="/Cute Halloween flying pumpkin.json" loop autoplay />
      </Suspense>
    </motion.div>
  );
}
