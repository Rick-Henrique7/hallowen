import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

export function RsvpForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [answer, setAnswer] = useState<"yes" | "no">("yes");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-serif text-lg text-ink"
      >
        {answer === "yes"
          ? `Até a noite das bruxas, ${name || "criatura"}. 🎃`
          : `Sentiremos sua falta, ${name || "criatura"}.`}
      </motion.p>
    );
  }

  return (
    <div className="w-full">
      <AnimatePresence mode="wait" initial={false}>
        {!open ? (
          <motion.button
            key="cta"
            type="button"
            onClick={() => setOpen(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="rounded-full bg-witch-deep px-8 py-3 font-display text-xl tracking-wide text-parchment shadow-[0_10px_25px_rgba(0,0,0,0.3)] transition-colors hover:bg-witch"
          >
            Confirmar Presença
          </motion.button>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onSubmit={(e) => {
              e.preventDefault();
              setDone(true);
              toast(answer === "yes" ? "Presença confirmada!" : "Resposta registrada.", {
                description:
                  answer === "yes"
                    ? "Prepare a fantasia — nos vemos no dia 31."
                    : "Que pena! Fica para a próxima assombração.",
              });
            }}
            className="mx-auto flex w-full max-w-sm flex-col gap-3"
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Seu nome"
              className="w-full rounded-md border border-ink/30 bg-parchment-shade/40 px-4 py-2.5 font-sans text-ink placeholder:text-ink/50 focus:border-witch focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
              {(["yes", "no"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAnswer(v)}
                  className={`rounded-md border px-3 py-2 font-sans text-sm transition-colors ${
                    answer === v
                      ? "border-witch bg-witch text-parchment"
                      : "border-ink/30 text-ink hover:bg-parchment-shade/50"
                  }`}
                >
                  {v === "yes" ? "Eu vou!" : "Não posso"}
                </button>
              ))}
            </div>
            <button
              type="submit"
              className="rounded-full bg-pumpkin-deep px-6 py-3 font-display text-lg tracking-wide text-parchment transition-colors hover:bg-pumpkin"
            >
              Enviar resposta
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
