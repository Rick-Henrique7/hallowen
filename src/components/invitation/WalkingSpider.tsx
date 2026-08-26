import { useEffect, useRef } from "react";
import { Lottie, type LottieHandle } from "lottie-react";
import { motion, useReducedMotion } from "motion/react";
import spiderWalkData from "@/assets/spider-walk.json";

type WalkingSpiderProps = {
  /** Top offset in pixels from the top of the parent container. */
  top: number;
  /** Total time to cross the parent (seconds). */
  duration?: number;
  /** Delay before the first cycle (seconds). */
  delay?: number;
  /** Width and height of the spider in pixels. */
  size?: number;
  /** Walk right-to-left when true. */
  reverse?: boolean;
  /** Additional class names for the wrapper. */
  className?: string;
};

/**
 * A spider that walks across its parent. Renders a Lottie animation
 * (8 legs stepping in alternating tripod gait) and translates the
 * whole spider horizontally across the container.
 *
 * Place inside a `position: relative; overflow: hidden` container
 * and give it a `top` value. Honors `prefers-reduced-motion`.
 */
export function WalkingSpider({
  top,
  duration = 24,
  delay = 0,
  size = 96,
  reverse = false,
  className = "",
}: WalkingSpiderProps) {
  const reduced = useReducedMotion();
  const lottieRef = useRef<LottieHandle>(null);
  const fromX = reverse ? "112%" : "-15%";
  const toX = reverse ? "-15%" : "112%";

  // Pause the Lottie when the user prefers reduced motion.
  useEffect(() => {
    if (!reduced) return;
    const handle = lottieRef.current;
    handle?.pause();
    return () => {
      // No-op cleanup; when reduced flips back to false, the
      // autoplay prop change will resume the animation.
    };
  }, [reduced]);

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
          reduced
            ? { y: 0, rotate: 0 }
            : { y: [0, -1.5, 0, -1.5, 0], rotate: [-1.5, 1.5, -1.5, 1.5, -1.5] }
        }
        transition={{
          duration: 0.5,
          repeat: reduced ? 0 : Infinity,
          ease: "easeInOut",
        }}
        style={{ width: size, height: size }}
      >
        <Lottie
          lottieRef={lottieRef}
          src={spiderWalkData}
          loop
          autoplay={!reduced}
          style={{ width: size, height: size }}
        />
      </motion.div>
    </motion.div>
  );
}
