import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Embers } from "@/components/invitation/Embers";
import { SpiderOverlay } from "@/components/invitation/SpiderOverlay";

const DEFAULT_TITLE = "Halloween Party — Você Está Convidado";
const DEFAULT_DESCRIPTION =
  "Abra o envelope e descubra os detalhes da nossa festa de Halloween: 31 de outubro, fantasia obrigatória. Confirme sua presença.";

// How long the open carta holds at the natural position before sliding
// out the bottom of the viewport. Tuned to feel like "shown briefly,
// then dismissed".
const HOLD_MS = 900;
// Slide-out duration (kept in sync with the ease curve below).
const SLIDE_OUT_MS = 800;
// Delay between the open carta settling and the leaf (prancheta) starting
// to grow out of the envelope. Small overlap feels more organic.
const PRANCHETA_DELAY_MS = 350;
// How long the leaf takes to grow from envelope-size to ~60% of the
// viewport. Tied to PRANCHETA_EASE below.
const PRANCHETA_GROW_MS = 900;

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
  const { name } = Route.useSearch();

  // Personalize the document title when a name is in the URL.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const base = "Halloween Party — Você Está Convidado";
    document.title = name ? `${name}, ${base}` : base;
  }, [name]);

  // After the open carta settles, wait HOLD_MS then trigger the
  // slide-out by flipping `sliding` to true. The carta animates
  // to y: 100vh and fades out.
  useEffect(() => {
    if (!open || sliding) return;
    const t = setTimeout(() => setSliding(true), HOLD_MS);
    return () => clearTimeout(t);
  }, [open, sliding]);

  function handleClick() {
    setOpen(true);
  }

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-crimson px-4 py-16">
      <div className="pointer-events-none absolute inset-0 spooky-vignette" aria-hidden="true" />
      <Embers />
      <SpiderOverlay />

      <div className="relative z-30 w-full max-w-xl">
        <AnimatePresence mode="wait">
          {!open && (
            <motion.button
              key="closed"
              type="button"
              onClick={handleClick}
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

        {/* Prancheta: leaf that grows out of the envelope. Sibling of the
            carta (not a child) so it does NOT inherit the carta's slide-out
            translateY. Anchored to the same center as the carta (the parent
            div is the envelope's bounding box). It stays on screen after
            the carta slides away — that's the whole point of the redesign. */}
        {open && (
          <motion.img
            src="/convite-verso.jpg"
            alt="Convite de Halloween"
            draggable={false}
            initial={{ opacity: 0, scale: 0.02, rotate: -2 }}
            animate={{ opacity: 1, scale: 0.5, rotate: 0 }}
            transition={{
              delay: PRANCHETA_DELAY_MS / 1000,
              duration: PRANCHETA_GROW_MS / 1000,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="pointer-events-none absolute left-1/2 top-[36%] z-10 w-[60vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 select-none bg-transparent object-contain"
            style={{ mixBlendMode: "multiply" }}
          />
        )}
      </div>
    </main>
  );
}
