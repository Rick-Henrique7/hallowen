import { motion, useReducedMotion } from "motion/react";
import { useIsMobile } from "@/hooks/use-mobile";

function SpiderSvg({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M20 20 6 10M20 20 4 20M20 20 6 30M20 20 9 36" />
      <path d="M20 20 34 10M20 20 36 20M20 20 34 30M20 20 31 36" />
      <ellipse cx="20" cy="21" rx="7" ry="8" fill="currentColor" stroke="none" />
      <circle cx="20" cy="12" r="4.5" fill="currentColor" stroke="none" />
      <circle cx="18" cy="11" r="1" fill="#FFB347" stroke="none" />
      <circle cx="22" cy="11" r="1" fill="#FFB347" stroke="none" />
    </svg>
  );
}

function Dangler({
  left,
  thread,
  delay,
  duration,
  size,
  still,
}: {
  left: string;
  thread: number;
  delay: number;
  duration: number;
  size: number;
  still: boolean;
}) {
  return (
    <div className="absolute top-0 flex flex-col items-center" style={{ left }}>
      <motion.div
        className="flex flex-col items-center"
        initial={{ y: -thread }}
        animate={still ? { y: 0 } : { y: [-thread * 0.6, 0, -thread * 0.6] }}
        transition={{ duration, delay, repeat: still ? 0 : Infinity, ease: "easeInOut" }}
      >
        <div className="w-px bg-soot/50" style={{ height: thread }} />
        <motion.div
          className="text-soot"
          animate={still ? {} : { rotate: [-6, 6, -6] }}
          transition={{ duration: 2.4, repeat: still ? 0 : Infinity, ease: "easeInOut" }}
        >
          <SpiderSvg size={size} />
        </motion.div>
      </motion.div>
    </div>
  );
}

function Crawler({
  top,
  delay,
  duration,
  size,
  reverse,
  still,
}: {
  top: string;
  delay: number;
  duration: number;
  size: number;
  reverse?: boolean;
  still: boolean;
}) {
  if (still) return null;
  return (
    <motion.div
      className="absolute text-soot/80"
      style={{ top }}
      initial={{ x: reverse ? "100vw" : "-10vw" }}
      animate={{ x: reverse ? "-10vw" : "100vw", y: [0, -8, 0, 8, 0] }}
      transition={{
        x: { duration, delay, repeat: Infinity, ease: "linear" },
        y: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      <SpiderSvg size={size} />
    </motion.div>
  );
}

export function SpiderOverlay() {
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  const still = Boolean(reduced);

  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden" aria-hidden="true">
      <Dangler left="12%" thread={110} delay={0} duration={7} size={30} still={still} />
      <Dangler left="78%" thread={170} delay={1.4} duration={9} size={38} still={still} />
      {!isMobile && (
        <>
          <Dangler left="45%" thread={80} delay={2.6} duration={6.2} size={24} still={still} />
          <Dangler left="92%" thread={220} delay={0.8} duration={10} size={28} still={still} />
          <Crawler top="18%" delay={3} duration={26} size={26} still={still} />
        </>
      )}
      <Crawler top="86%" delay={1} duration={32} size={22} reverse still={still} />
    </div>
  );
}
