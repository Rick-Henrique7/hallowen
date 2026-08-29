import { useEffect, useState } from "react";
import { deleteInvite, updateInvite } from "@/api/functions/invites";
import {
  buildInviteUrl,
  buildMailtoUrl,
  buildWhatsAppUrl,
  formatEmail,
  formatWhatsApp,
} from "@/lib/messages";

type Invite = {
  id: number;
  name: string;
  sent: boolean;
  confirmed: boolean;
  createdAt: Date | string;
};

type InviteRowProps = {
  invite: Invite;
  onChanged: () => void;
};

export function InviteRow({ invite, onChanged }: InviteRowProps) {
  // Optimistic local copy: the UI updates instantly on toggle, then
  // the server function runs in the background. If it fails, we
  // revert. This is what makes the toggle feel "instant" on slow DBs.
  const [local, setLocal] = useState<Invite>(invite);
  const [busy, setBusy] = useState<"toggle" | "delete" | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  // The invite URL depends on window.location.origin (only available on the
  // client). To avoid a React hydration mismatch — where the server-rendered
  // HTML has an empty origin in the WhatsApp/email hrefs but the client
  // produces the real origin — we render with an empty URL during SSR + the
  // initial client render, then populate it via useEffect after hydration.
  // The user sees the link update immediately (same paint frame as hydration).
  const [inviteUrl, setInviteUrl] = useState("");
  useEffect(() => {
    if (typeof window === "undefined") return;
    setInviteUrl(buildInviteUrl(window.location.origin, local.id, local.name));
  }, [local.id, local.name]);

  const whatsappText = formatWhatsApp(local.name, inviteUrl);
  const email = formatEmail(local.name, inviteUrl);

  async function handleToggle(field: "sent" | "confirmed") {
    if (busy) return;
    const previous = local;
    const next = { ...local, [field]: !local[field] };
    setLocal(next); // instant UI update (no waiting for server)
    setBusy("toggle");
    try {
      await updateInvite({ data: { id: next.id, [field]: next[field] } });
      onChanged();
    } catch {
      setLocal(previous); // revert if server fails
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    if (busy) return;
    if (!window.confirm(`Excluir o convite de "${local.name}"? Essa ação não pode ser desfeita.`)) {
      return;
    }
    setBusy("delete");
    try {
      await deleteInvite({ data: { id: local.id } });
      onChanged();
    } finally {
      setBusy(null);
    }
  }

  async function handleCopy() {
    // Compute the URL on demand so the copy always uses the freshest value,
    // even if the user clicks before the post-hydration useEffect has run.
    const url = buildInviteUrl(window.location.origin, local.id, local.name);
    try {
      await navigator.clipboard.writeText(url);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 1500);
    } catch {
      setCopyState("failed");
      setTimeout(() => setCopyState("idle"), 2000);
    }
  }

  // Touch targets: every interactive element is at least 44x44px so
  // the row is comfortable to use on a phone with one hand.
  const toggleClass =
    "inline-flex h-11 min-w-[44px] cursor-pointer items-center gap-2 rounded-sm px-2 text-parchment/80 transition-colors hover:bg-parchment/10";
  const actionClass =
    "inline-flex h-11 min-w-[44px] items-center justify-center gap-2 rounded-sm border border-parchment/20 px-3 text-sm text-parchment/80 transition-colors hover:border-parchment hover:text-parchment disabled:opacity-50";
  const dangerClass =
    "inline-flex h-11 min-w-[44px] items-center justify-center gap-2 rounded-sm border border-pumpkin-deep/60 px-3 text-sm text-pumpkin-deep transition-colors hover:bg-pumpkin-deep hover:text-parchment disabled:opacity-50";

  return (
    <li
      className={busy ? "pointer-events-none opacity-60 transition-opacity" : "transition-opacity"}
    >
      {/* On mobile: stacked card. On sm+: table-row. */}
      <div className="flex flex-col gap-3 p-4 sm:table-cell sm:gap-1 sm:p-3">
        <div>
          <p className="font-sans text-base text-parchment">{local.name}</p>
        </div>

        {/* Toggles: wrap on narrow, side-by-side on wider */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <label className={toggleClass}>
            <input
              type="checkbox"
              checked={local.sent}
              onChange={() => handleToggle("sent")}
              disabled={busy !== null}
              className="h-5 w-5 cursor-pointer accent-pumpkin"
              aria-label="Marcado como enviado"
            />
            <span className="font-sans text-sm">Enviado</span>
          </label>
          <label className={toggleClass}>
            <input
              type="checkbox"
              checked={local.confirmed}
              onChange={() => handleToggle("confirmed")}
              disabled={busy !== null}
              className="h-5 w-5 cursor-pointer accent-pumpkin"
              aria-label="Marcado como confirmado"
            />
            <span className="font-sans text-sm">Confirmou</span>
          </label>
        </div>

        {/* Action buttons: icon-only on small, with labels when there's room */}
        <div className="flex flex-wrap gap-2">
          <a
            href={buildWhatsAppUrl(whatsappText)}
            target="_blank"
            rel="noopener noreferrer"
            className={actionClass}
            title="Abrir WhatsApp com mensagem pré-formatada"
          >
            💬 <span className="hidden sm:inline">WhatsApp</span>
          </a>
          <a
            href={buildMailtoUrl("", email.subject, email.body)}
            className={actionClass}
            title="Abrir cliente de email com mensagem pré-formatada"
          >
            ✉️ <span className="hidden sm:inline">Email</span>
          </a>
          <button
            type="button"
            onClick={handleCopy}
            disabled={busy !== null}
            className={actionClass}
            title="Copiar link do convite"
          >
            {copyState === "copied" ? (
              "✓"
            ) : copyState === "failed" ? (
              "✗"
            ) : (
              <>
                🔗 <span className="hidden sm:inline">Copiar</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={busy !== null}
            className={dangerClass}
            title="Excluir convite"
          >
            🗑️ <span className="hidden sm:inline">Excluir</span>
          </button>
        </div>
      </div>
    </li>
  );
}
