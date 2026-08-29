import { useState } from "react";
import { createInvite } from "@/api/functions/invites";

type InviteFormProps = {
  onCreated: () => void;
};

export function InviteForm({ onCreated }: InviteFormProps) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    setSubmitting(true);
    try {
      await createInvite({ data: { name: name.trim() } });
      setName("");
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-start">
      <div className="flex-1">
        <input
          type="text"
          placeholder="Nome do convidado"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          required
          className="block h-11 w-full rounded-sm border border-parchment/20 bg-parchment/10 px-3 font-sans text-base text-parchment placeholder:text-parchment/40 focus:border-ember focus:outline-none sm:text-sm"
        />
        {error && (
          <p role="alert" className="mt-2 font-sans text-xs text-pumpkin-deep">
            {error}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={submitting || !name.trim()}
        className="h-11 rounded-sm bg-pumpkin px-5 font-sans text-sm font-semibold uppercase tracking-widest text-soot transition-colors hover:bg-pumpkin-deep hover:text-parchment disabled:opacity-50"
      >
        {submitting ? "Gerando..." : "+ Gerar"}
      </button>
    </form>
  );
}
