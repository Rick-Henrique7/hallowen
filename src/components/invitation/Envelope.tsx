import { motion } from "motion/react";

export function Envelope({ open, onOpen }: { open: boolean; onOpen: () => void }) {
  return (
    <motion.div
      className="relative flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.9, y: 0 }}
      animate={open ? { y: 460, opacity: 0, scale: 0.85 } : { y: 0, opacity: 1, scale: 1 }}
      transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
    >

      <motion.button
        type="button"
        onClick={onOpen}
        aria-label="Abrir o convite"
        className="group relative block w-[86vw] max-w-md cursor-pointer focus:outline-none"
        animate={{ y: [0, -14, 0], rotate: [-1, 1.2, -1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
      >
        <svg
          viewBox="0 0 400 260"
          className="w-full drop-shadow-[0_25px_45px_rgba(0,0,0,0.45)]"
          role="img"
          aria-hidden="true"
        >
          <rect x="4" y="24" width="392" height="228" rx="8" fill="var(--witch-deep)" />
          <rect
            x="4"
            y="24"
            width="392"
            height="228"
            rx="8"
            fill="none"
            stroke="var(--ember)"
            strokeOpacity="0.5"
            strokeWidth="2"
          />
          <path d="M4 32 200 168 396 32" fill="var(--witch)" />
          <path
            d="M4 32 200 168 396 32"
            fill="none"
            stroke="var(--ember)"
            strokeOpacity="0.55"
            strokeWidth="2"
          />
          <path d="M4 250 150 140 4 44Z" fill="var(--witch)" fillOpacity="0.55" />
          <path d="M396 250 250 140 396 44Z" fill="var(--witch)" fillOpacity="0.55" />
          {/* wax seal */}
          <circle cx="200" cy="168" r="34" fill="var(--pumpkin-deep)" />
          <circle
            cx="200"
            cy="168"
            r="34"
            fill="none"
            stroke="var(--ember)"
            strokeWidth="2"
            strokeOpacity="0.8"
          />
          <path
            d="M200 150c8 0 11 5 11 9 0 8-11 9-11 17 0-8-11-9-11-17 0-4 3-9 11-9Z"
            fill="var(--parchment)"
            fillOpacity="0.9"
          />
          <circle cx="200" cy="184" r="3" fill="var(--parchment)" fillOpacity="0.9" />
        </svg>
      </motion.button>

      <motion.p
        className="mt-8 font-display text-xl tracking-wide text-parchment/90 sm:text-2xl"
        animate={{ opacity: [0.45, 1, 0.45] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      >
        Toque no envelope
      </motion.p>
    </motion.div>
  );
}
