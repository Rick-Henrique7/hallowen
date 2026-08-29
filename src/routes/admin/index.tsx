import { useMemo, useState } from "react";
import { createFileRoute, redirect, useRouteContext, useRouter } from "@tanstack/react-router";
import { getCurrentAdmin, logout } from "@/api/functions/auth";
import { listInvites } from "@/api/functions/invites";
import { InviteForm } from "@/components/admin/InviteForm";
import { StatusFilter, type StatusFilterValue } from "@/components/admin/StatusFilter";
import { InviteRow } from "@/components/admin/InviteRow";

export const Route = createFileRoute("/admin/")({
  beforeLoad: async () => {
    const current = await getCurrentAdmin();
    if (!current) {
      throw redirect({ to: "/admin/login" });
    }
    return { current };
  },
  loader: async () => {
    return { invites: await listInvites() };
  },
  component: AdminPanel,
});

type Invite = {
  id: number;
  name: string;
  sent: boolean;
  confirmed: boolean;
  createdAt: Date | string;
};

function matchesStatus(inv: Invite, status: StatusFilterValue): boolean {
  switch (status) {
    case "all":
      return true;
    case "pending":
      return !inv.sent && !inv.confirmed;
    case "sent":
      return inv.sent && !inv.confirmed;
    case "confirmed":
      return inv.confirmed;
  }
}

function matchesQuery(inv: Invite, q: string): boolean {
  if (!q) return true;
  return inv.name.toLowerCase().includes(q.toLowerCase());
}

function AdminPanel() {
  const { current } = useRouteContext({ from: "/admin/" });
  const { invites } = Route.useLoaderData();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilterValue>("all");

  const filtered = useMemo(
    () => invites.filter((i) => matchesStatus(i, status) && matchesQuery(i, query)),
    [invites, status, query],
  );

  function refresh() {
    void router.invalidate();
  }

  async function handleLogout() {
    await logout();
    await router.navigate({ to: "/admin/login" });
  }

  return (
    <main className="min-h-screen bg-crimson px-3 py-6 text-parchment sm:px-6 sm:py-12">
      <div className="mx-auto max-w-4xl">
        {/* Header: stacks on mobile, row on sm+ */}
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl">Convites de Halloween</h1>
            <p className="mt-1 font-sans text-sm text-parchment/60">
              Logado como <strong>{current.username}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="self-start rounded-sm border border-parchment/30 px-4 py-2 font-sans text-xs uppercase tracking-widest text-parchment/80 transition-colors hover:border-parchment hover:text-parchment sm:self-auto"
          >
            Sair
          </button>
        </header>

        {/* New invite form: section stays the same, InviteForm is responsive internally */}
        <section className="mb-6 rounded-sm border border-crimson-deep bg-crimson-deep/40 p-4 sm:p-5">
          <h2 className="mb-3 font-serif text-sm uppercase tracking-widest text-parchment/70">
            Novo convite
          </h2>
          <InviteForm onCreated={refresh} />
        </section>

        {/* Search + filter: stacks on mobile */}
        <section className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <input
            type="search"
            placeholder="Buscar por nome…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-w-0 flex-1 rounded-sm border border-parchment/20 bg-parchment/10 px-3 py-2 font-sans text-base text-parchment placeholder:text-parchment/40 focus:border-ember focus:outline-none sm:text-sm"
          />
          <div className="flex items-center gap-3">
            <StatusFilter value={status} onChange={setStatus} />
            <span className="font-sans text-xs text-parchment/50">
              {filtered.length} de {invites.length}
            </span>
          </div>
        </section>

        {/* Invites list: ul/li on mobile, table on sm+ */}
        <section className="overflow-hidden rounded-sm border border-crimson-deep bg-crimson-deep/30">
          {invites.length === 0 ? (
            <div className="p-8 text-center">
              <p className="font-serif text-parchment/70">
                Nenhum convite ainda. Crie o primeiro acima! 🎃
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center">
              <p className="font-serif text-parchment/70">
                Nenhum convite combina com o filtro atual.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-parchment/10">
              {filtered.map((inv) => (
                <InviteRow key={inv.id} invite={inv} onChanged={refresh} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
