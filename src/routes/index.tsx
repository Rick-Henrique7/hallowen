import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence } from "motion/react";
import { Envelope } from "@/components/invitation/Envelope";
import { LetterCard } from "@/components/invitation/LetterCard";
import { SpiderOverlay } from "@/components/invitation/SpiderOverlay";
import { Embers } from "@/components/invitation/Embers";

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
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-pumpkin px-4 py-16">
      <div className="pointer-events-none absolute inset-0 spooky-vignette" aria-hidden="true" />
      <Embers />
      <SpiderOverlay />

      {/* Envelope: centered overlay so it can slide down and fade while the letter expands */}
      <div
        className={`absolute inset-0 z-30 flex items-center justify-center ${
          open ? "pointer-events-none" : ""
        }`}
        aria-hidden={open}
      >
        <Envelope open={open} onOpen={() => setOpen(true)} />
      </div>

      <AnimatePresence>
        {open && <LetterCard key="letter" onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </main>
  );
}

