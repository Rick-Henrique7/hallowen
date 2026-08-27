import { createFileRoute, redirect, useRouteContext, useRouter } from "@tanstack/react-router";
import { getCurrentAdmin, logout } from "@/server/functions/auth";

export const Route = createFileRoute("/admin/")({
  beforeLoad: async () => {
    const current = await getCurrentAdmin();
    if (!current) {
      throw redirect({ to: "/admin/login" });
    }
    return { current };
  },
  component: AdminPanelPlaceholder,
});

function AdminPanelPlaceholder() {
  const { current } = useRouteContext({ from: "/admin/" });
  const router = useRouter();

  async function handleLogout() {
    await logout();
    await router.navigate({ to: "/admin/login" });
  }

  return (
    <main className="min-h-screen bg-crimson px-4 py-12 text-parchment">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl">Convites de Halloween</h1>
            <p className="font-sans text-sm text-parchment/60">
              Logado como <strong>{current.username}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-sm border border-parchment/30 px-4 py-2 font-sans text-xs uppercase tracking-widest text-parchment/80 transition-colors hover:border-parchment hover:text-parchment"
          >
            Sair
          </button>
        </header>

        <div className="rounded-sm border border-crimson-deep bg-crimson-deep/40 p-6">
          <p className="font-serif text-parchment/80">
            Painel placeholder. CRUD de convidados entra na Phase 3.
          </p>
          <p className="mt-2 font-sans text-sm text-parchment/50">
            A rota <code className="rounded bg-soot/50 px-1">/admin</code> tá protegida — você só
            chega aqui com sessão válida. ✅
          </p>
        </div>
      </div>
    </main>
  );
}
