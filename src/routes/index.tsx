import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Embers } from "@/components/invitation/Embers";
import { SpiderOverlay } from "@/components/invitation/SpiderOverlay";
import { WalkingSpider } from "@/components/invitation/WalkingSpider";

const DEFAULT_TITLE = "Halloween Party — Você Está Convidado";
const DEFAULT_DESCRIPTION =
  "Abra o envelope e descubra os detalhes da nossa festa de Halloween: 31 de outubro, fantasia obrigatória. Confirme sua presença.";

type Search = {
  name?: string;
  id?: string;
};

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): Search => {
    const result: Search = {};
    if (typeof search["name"] === "string") result.name = search["name"];
    if (typeof search["id"] === "string") result.id = search["id"];
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
  const { name } = Route.useSearch();

  // Personalize the document title when a name is in the URL.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const base = "Halloween Party — Você Está Convidado";
    document.title = name ? `${name}, ${base}` : base;
  }, [name]);

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-crimson px-4 py-16">
      <div className="pointer-events-none absolute inset-0 spooky-vignette" aria-hidden="true" />
      <Embers />
      <SpiderOverlay />

      <div className="relative z-30 w-full max-w-4xl">
        <AnimatePresence mode="wait">
          {!open && (
            <motion.button
              key="closed"
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Abrir o convite"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10, transition: { duration: 0.25 } }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="group relative block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-crimson"
            >
              <img
                src="/envelope-fechado.svg"
                alt="Envelope de Halloween fechado"
                draggable={false}
                className="block h-auto w-full select-none drop-shadow-[0_35px_60px_rgba(0,0,0,0.55)] transition-transform duration-300 group-hover:scale-[1.02] group-hover:-translate-y-1"
                style={{ mixBlendMode: "multiply" }}
              />
            </motion.button>
          )}

          {open && (
            <motion.div
              key="open"
              initial={{ opacity: 0, scale: 0.7, y: 60 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.25 } }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative isolate aspect-[3/2] w-full overflow-hidden rounded-sm shadow-[0_35px_80px_rgba(0,0,0,0.55)]"
            >
              <img
                src="/envelope-aberto.svg"
                alt="Envelope de Halloween aberto"
                draggable={false}
                className="block h-full w-full select-none object-cover"
                style={{ mixBlendMode: "multiply" }}
              />

              {/* Personalized greeting overlay */}
              {name && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="pointer-events-none absolute inset-x-0 top-[8%] flex flex-col items-center px-6 text-center"
                >
                  <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-parchment/60 sm:text-xs">
                    Para
                  </span>
                  <span className="mt-1 break-words font-display text-2xl text-parchment drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] sm:text-3xl md:text-4xl">
                    {name}
                  </span>
                </motion.div>
              )}

              {/* Spiders walking inside the open envelope */}
              <WalkingSpider top={56} duration={26} delay={1} size={80} />
              <WalkingSpider top={340} duration={32} delay={7} size={64} reverse />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
