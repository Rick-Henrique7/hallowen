import { useState } from "react";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { login } from "@/api/functions/auth";

export const Route = createFileRoute("/admin/login")({
  beforeLoad: async () => {
    // If already logged in, send straight to the panel.
    // (Uses the server function via fetch under the hood.)
    // Note: we can't easily call server fns in beforeLoad here without
    // turning it into a loader, so we rely on the panel route's own
    // auth check. Login is a no-op if you're already authed.
  },
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ data: { username, password } });
      await router.navigate({ to: "/admin" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar");
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-crimson px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-sm border border-crimson-deep bg-crimson-deep/40 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
      >
        <h1 className="mb-2 font-display text-3xl text-parchment">Painel Admin</h1>
        <p className="mb-6 font-sans text-sm text-parchment/60">Entre com usuário e senha.</p>

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
            className="mt-1 block w-full rounded-sm border border-soot bg-parchment/10 px-3 py-2 font-sans text-parchment placeholder:text-parchment/30 focus:border-ember focus:outline-none"
          />
        </label>

        <label className="mb-5 block">
          <span className="block font-sans text-xs uppercase tracking-widest text-parchment/60">
            Senha
          </span>
          <input
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-sm border border-soot bg-parchment/10 px-3 py-2 font-sans text-parchment placeholder:text-parchment/30 focus:border-ember focus:outline-none"
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
          className="w-full rounded-sm bg-pumpkin px-4 py-2 font-sans text-sm font-semibold uppercase tracking-widest text-soot transition-colors hover:bg-pumpkin-deep hover:text-parchment disabled:opacity-50"
        >
          {submitting ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
