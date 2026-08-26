import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Embers } from "@/components/invitation/Embers";
import { SpiderOverlay } from "@/components/invitation/SpiderOverlay";
import { WalkingSpider } from "@/components/invitation/WalkingSpider";

const TITLE = "Halloween Party — Você Está Convidado";
const DESCRIPTION =
  "Abra o envelope e descubra os detalhes da nossa festa de Halloween: 31 de outubro, fantasia obrigatória. Confirme sua presença.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [open, setOpen] = useState(false);

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
              className="group relative isolate block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-crimson"
            >
              <img
                src="/envelope-fechado.svg"
                alt="Envelope de Halloween fechado"
                draggable={false}
                className="block h-auto w-full select-none drop-shadow-[0_35px_60px_rgba(0,0,0,0.55)] transition-transform duration-300 group-hover:scale-[1.02] group-hover:-translate-y-1"
                style={{ mixBlendMode: "darken" }}
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
                style={{ mixBlendMode: "darken" }}
              />

              {/* Spiders walking inside the open envelope */}
              <WalkingSpider top={40} duration={26} delay={1} size={88} />
              <WalkingSpider top={320} duration={32} delay={7} size={72} reverse />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
