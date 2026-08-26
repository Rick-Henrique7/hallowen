import { motion, useReducedMotion } from "motion/react";

type WalkingSpiderProps = {
  /** Top offset in pixels from the top of the parent container. */
  top: number;
  /** Total time to cross the parent (seconds). */
  duration?: number;
  /** Delay before the first cycle (seconds). */
  delay?: number;
  /** Width of the spider image in pixels. */
  size?: number;
  /** Walk right-to-left when true. */
  reverse?: boolean;
  /** Additional class names for the wrapper. */
  className?: string;
  /** Optional image src. Defaults to the bundled /spider-walk.png. */
  src?: string;
};

const STEP_DURATION = 0.45; // one full bob/swing cycle

/**
 * A spider that walks across its parent. Uses a static PNG sprite of a
 * spider on a parchment-colored background (so it blends into the
 * invitation card) and animates it with a translation + a slight bob +
 * a small rotational swing to fake a step.
 *
 * Place inside a `position: relative; overflow: hidden` container and
 * give it a `top` value. Honors `prefers-reduced-motion`.
 */
export function WalkingSpider({
  top,
  duration = 22,
  delay = 0,
  size = 80,
  reverse = false,
  className = "",
  src = "/spider-walk.png",
}: WalkingSpiderProps) {
  const reduced = useReducedMotion();
  const fromX = reverse ? "112%" : "-18%";
  const toX = reverse ? "-18%" : "112%";

  return (
    <motion.div
      className={`pointer-events-none absolute drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)] ${className}`}
      style={{ top, willChange: "transform" }}
      initial={{ x: fromX, opacity: 0 }}
      animate={{
        x: toX,
        opacity: reduced ? 0.7 : [0, 1, 1, 0],
      }}
      transition={{
        x: { duration, delay, repeat: Infinity, ease: "linear" },
        opacity: {
          duration,
          delay,
          repeat: Infinity,
          times: [0, 0.06, 0.94, 1],
        },
      }}
      aria-hidden="true"
    >
      <motion.div
        animate={
          reduced ? { y: 0, rotate: 0 } : { y: [0, -1.8, 0, -1.8, 0], rotate: [-2, 2, -2, 2, -2] }
        }
        transition={{
          duration: STEP_DURATION,
          repeat: reduced ? 0 : Infinity,
          ease: "easeInOut",
        }}
        style={{ width: size, height: size }}
      >
        <img
          src={src}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="block h-full w-full select-none object-contain"
        />
      </motion.div>
    </motion.div>
  );
}
