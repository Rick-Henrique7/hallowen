import { motion } from "motion/react";
import { OrnateFrame } from "./OrnateFrame";
import { RsvpForm } from "./RsvpForm";

const DETAILS = [
  { label: "Data", value: "31 de Outubro, 2026" },
  { label: "Horário", value: "21h até o amanhecer" },
  { label: "Local", value: "Casa Assombrada — Rua das Almas, 666" },
  { label: "Traje", value: "Fantasia obrigatória" },
];

export function LetterCard({ onClose }: { onClose: () => void }) {
  return (
    <motion.article
      className="relative z-30 h-auto w-[90vw] max-w-3xl origin-bottom overflow-hidden rounded-sm bg-parchment parchment-grain shadow-[0_35px_80px_rgba(0,0,0,0.55)]"
      initial={{ y: 160, scale: 0.3, opacity: 0 }}
      animate={{ y: [160, -30, 0], scale: [0.3, 0.34, 1], opacity: [0, 1, 1] }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.4 } }}
      transition={{ duration: 1.9, times: [0, 0.32, 1], ease: [0.22, 1, 0.36, 1] }}
    >
      <OrnateFrame />

      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar o convite"
        className="absolute top-3 right-3 z-10 rounded-full px-2 py-1 font-sans text-xs text-ink/60 transition-colors hover:text-ink sm:top-5 sm:right-5"
      >
        fechar
      </button>

      <div className="relative px-8 py-12 text-center sm:px-16 sm:py-16 md:px-24">
        <p className="font-serif text-sm tracking-[0.4em] text-ink/70 uppercase">
          You Are Invited...
        </p>

        <h1 className="mt-4 font-display text-5xl leading-none text-witch-deep sm:text-7xl md:text-8xl">
          Halloween
          <span className="block text-pumpkin-deep">Party</span>
        </h1>

        <div className="mx-auto mt-6 flex items-center justify-center gap-3 text-ink/50">
          <span className="h-px w-16 bg-current" />
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
            <path d="M2 14c3-4 5-1 6 1 1-3 3-6 4-3 1-3 3 0 4 3 1-2 3-5 6-1-3 0-4 2-4 4-2-2-3-2-4 1-1-3-2-3-4-1-1-3-2-3-4 1 0-2-1-4-4-4Z" />
          </svg>
          <span className="h-px w-16 bg-current" />
        </div>

        <p className="mx-auto mt-6 max-w-md font-serif text-lg text-ink/85 sm:text-xl">
          Uma noite de sustos, doces e travessuras. Traga sua alma — e sua melhor fantasia.
        </p>

        <dl className="mx-auto mt-10 grid max-w-xl grid-cols-1 gap-5 text-left sm:grid-cols-2">
          {DETAILS.map((d) => (
            <div key={d.label} className="border-l-2 border-pumpkin-deep/60 pl-4">
              <dt className="font-sans text-[11px] tracking-[0.25em] text-ink/60 uppercase">
                {d.label}
              </dt>
              <dd className="mt-1 font-sans text-base leading-snug text-ink sm:text-lg">
                {d.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-12 flex justify-center">
          <RsvpForm />
        </div>
      </div>
    </motion.article>
  );
}
