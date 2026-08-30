import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Embers } from "@/components/invitation/Embers";
import { SpiderOverlay } from "@/components/invitation/SpiderOverlay";

const DEFAULT_TITLE = "Halloween Party — Você Está Convidado";
const DEFAULT_DESCRIPTION =
  "Abra o envelope e descubra os detalhes da nossa festa de Halloween: 31 de outubro, fantasia obrigatória. Confirme sua presença.";

// Carta aberta slide-out: how long the carta holds before sliding off,
// and how long the slide takes.
const HOLD_MS = 900;
const SLIDE_OUT_MS = 800;
// Convite (verso/frente): delay + duration of the entry grow, and
// duration of the 3D flip on click.
const LEAF_DELAY_MS = 350;
const LEAF_GROW_MS = 900;
const FLIP_MS = 650;

type Search = {
  name?: string;
  id?: number;
};

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): Search => {
    const result: Search = {};
    if (typeof search["name"] === "string") result.name = search["name"];
    if (typeof search["id"] === "string") {
      const n = Number.parseInt(search["id"], 10);
      if (Number.isFinite(n) && n > 0) result.id = n;
    }
    return result;
  },
  head: () => ({
    meta: [
      { title: DEFAULT_TITLE },
      { name: "description", content: DEFAULT_DESCRIPTION },
      { property: "og:title", content: DEFAULT_TITLE },
      { property: "og:description", content: DEFAULT_DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [open, setOpen] = useState(false);
  const [sliding, setSliding] = useState(false);
  // Frente (outside) is the default face after the carta opens; click
  // flips to verso (inside), second click flips back to frente.
  const [showFrente, setShowFrente] = useState(true);
  const { name } = Route.useSearch();

  useEffect(() => {
    if (typeof document === "undefined") return;
    const base = "Halloween Party — Você Está Convidado";
    document.title = name ? `${name}, ${base}` : base;
  }, [name]);

  // After the open carta settles, wait HOLD_MS then trigger the
  // slide-out by flipping `sliding` to true.
  useEffect(() => {
    if (!open || sliding) return;
    const t = setTimeout(() => setSliding(true), HOLD_MS);
    return () => clearTimeout(t);
  }, [open, sliding]);

  function handleClickCarta() {
    setOpen(true);
  }

  function handleClickLeaf() {
    setShowFrente((prev) => !prev);
  }

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-crimson px-4 py-16">
      <div className="pointer-events-none absolute inset-0 spooky-vignette" aria-hidden="true" />
      <Embers />
      <SpiderOverlay />

      {/* Envelope (closed / open). Centered, max-w-xl. */}
      <div className="relative z-30 w-full max-w-xl">
        <AnimatePresence mode="wait">
          {!open && (
            <motion.button
              key="closed"
              type="button"
              onClick={handleClickCarta}
              aria-label="Abrir o convite"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10, transition: { duration: 0.25 } }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="group relative block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-crimson"
            >
              <img
                src="/carta-fechada.svg"
                alt="Carta de Halloween fechada"
                draggable={false}
                className="block h-auto w-full select-none bg-transparent transition-transform duration-300 group-hover:scale-[1.02] group-hover:-translate-y-1"
                style={{ mixBlendMode: "multiply" }}
              />
            </motion.button>
          )}

          {open && (
            <motion.div
              key="open"
              initial={{ opacity: 0, scale: 0.7, y: 60 }}
              animate={sliding ? { opacity: 0, y: "100vh" } : { opacity: 1, scale: 1, y: 0 }}
              transition={
                sliding
                  ? { duration: SLIDE_OUT_MS / 1000, ease: [0.55, 0, 1, 0.45] }
                  : { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
              }
              className="relative w-full"
            >
              <img
                src="/carta-aberta.svg"
                alt="Carta de Halloween aberta"
                draggable={false}
                className="block h-auto w-full select-none bg-transparent"
                style={{ mixBlendMode: "multiply" }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Convite (verso / frente). Sibling of the envelope, full-viewport
          centered layer so it sits in the middle of the screen regardless
          of the envelope's max-w-xl width. Stays after the carta slides
          off — the user can keep flipping it. */}
      {open && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
          <motion.button
            type="button"
            onClick={handleClickLeaf}
            aria-label={showFrente ? "Mostrar verso do convite" : "Mostrar frente do convite"}
            // Outer container only owns the 3D flip rotation. Opacity,
            // scale, and entry animation live on the inner LeafEntry so
            // the two animations don't fight each other.
            animate={{ rotateY: showFrente ? 180 : 0 }}
            transition={{ duration: FLIP_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformStyle: "preserve-3d" }}
            className="pointer-events-auto w-[40vw] max-w-md cursor-pointer select-none appearance-none border-0 bg-transparent p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-crimson"
          >
            <LeafEntry delayMs={LEAF_DELAY_MS} growMs={LEAF_GROW_MS}>
              {/* Verso: the inside of the card. Shows by default
                  (container rotateY=0, this face's back is hidden). */}
              <img
                src="/convite-verso.jpg"
                alt="Verso do convite de Halloween"
                draggable={false}
                className="block w-full select-none bg-transparent object-contain"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  mixBlendMode: "multiply",
                }}
              />
              {/* Frente: the outside. Pre-rotated 180deg so when the
                  container is rotated 180deg, this face's total rotation
                  is 360deg (= 0deg, front-facing) and becomes visible. */}
              <img
                src="/convite-frente.jpg"
                alt="Frente do convite de Halloween"
                draggable={false}
                className="absolute inset-0 block w-full select-none bg-transparent object-contain"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  mixBlendMode: "multiply",
                }}
              />
            </LeafEntry>
          </motion.button>
        </div>
      )}
    </main>
  );
}

/**
 * Owns the "grow from a tiny centered mark to full size" entry
 * animation. The flip is on the parent so they don't fight each
 * other for the same transform property.
 */
function LeafEntry({
  delayMs,
  growMs,
  children,
}: {
  delayMs: number;
  growMs: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.04, rotate: -2 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{
        delay: delayMs / 1000,
        duration: growMs / 1000,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative w-full"
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </motion.div>
  );
}
