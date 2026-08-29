import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { setupAdmin, login } from "@/api/functions/auth";

export const Route = createFileRoute("/admin/setup")({
  component: SetupPage,
});

function SetupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("A senha precisa ter no mínimo 8 caracteres");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não conferem");
      return;
    }

    setSubmitting(true);
    try {
      await setupAdmin({ data: { username, password } });
      // Auto-login after setup
      await login({ data: { username, password } });
      await router.navigate({ to: "/admin" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar admin");
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-crimson px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-sm border border-crimson-deep bg-crimson-deep/40 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
      >
        <h1 className="mb-2 font-display text-3xl text-parchment">Criar Admin</h1>
        <p className="mb-6 font-sans text-sm text-parchment/60">
          Primeira vez? Defina o usuário e a senha do painel. Isso só pode ser feito uma vez.
        </p>

        <label className="mb-3 block">
          <span className="block font-sans text-xs uppercase tracking-widest text-parchment/60">
            Usuário
          </span>
          <input
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block h-11 w-full rounded-sm border border-soot bg-parchment/10 px-3 font-sans text-base text-parchment placeholder:text-parchment/30 focus:border-ember focus:outline-none sm:text-sm"
          />
        </label>

        <label className="mb-3 block">
          <span className="block font-sans text-xs uppercase tracking-widest text-parchment/60">
            Senha (mín. 8)
          </span>
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block h-11 w-full rounded-sm border border-soot bg-parchment/10 px-3 font-sans text-base text-parchment placeholder:text-parchment/30 focus:border-ember focus:outline-none sm:text-sm"
          />
        </label>

        <label className="mb-5 block">
          <span className="block font-sans text-xs uppercase tracking-widest text-parchment/60">
            Confirmar senha
          </span>
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1 block h-11 w-full rounded-sm border border-soot bg-parchment/10 px-3 font-sans text-base text-parchment placeholder:text-parchment/30 focus:border-ember focus:outline-none sm:text-sm"
          />
        </label>

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-sm border border-pumpkin-deep/60 bg-pumpkin-deep/20 px-3 py-2 font-sans text-sm text-parchment"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="h-11 w-full rounded-sm bg-pumpkin px-4 font-sans text-sm font-semibold uppercase tracking-widest text-soot transition-colors hover:bg-pumpkin-deep hover:text-parchment disabled:opacity-50"
        >
          {submitting ? "Criando..." : "Criar e entrar"}
        </button>
      </form>
    </main>
  );
}
