import { useState } from "react";
import { deleteInvite, updateInvite } from "@/api/functions/invites";
import {
  buildInviteUrl,
  buildMailtoUrl,
  buildWhatsAppUrl,
  formatEmail,
  formatWhatsApp,
} from "@/lib/messages";

type Invite = {
  id: string;
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
  const [busy, setBusy] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const inviteUrl = buildInviteUrl(origin, invite.id, invite.name);
  const whatsappText = formatWhatsApp(invite.name, inviteUrl);
  const email = formatEmail(invite.name, inviteUrl);

  async function handleToggle(field: "sent" | "confirmed") {
    setBusy(true);
    try {
      await updateInvite({ data: { id: invite.id, [field]: !invite[field] } });
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(`Excluir o convite de "${invite.name}"? Essa ação não pode ser desfeita.`)
    ) {
      return;
    }
    setBusy(true);
    try {
      await deleteInvite({ data: { id: invite.id } });
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 1500);
    } catch {
      setCopyState("failed");
      setTimeout(() => setCopyState("idle"), 2000);
    }
  }

  return (
    <tr
      className={
        busy ? "opacity-60 transition-opacity" : "border-b border-parchment/10 transition-opacity"
      }
    >
      <td className="px-3 py-3 align-top">
        <div className="font-sans text-base text-parchment">{invite.name}</div>
        <div className="mt-0.5 font-mono text-xs text-parchment/40">/?id={invite.id}</div>
      </td>

      <td className="px-3 py-3 text-center align-top">
        <label className="inline-flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={invite.sent}
            onChange={() => handleToggle("sent")}
            disabled={busy}
            className="h-4 w-4 cursor-pointer accent-pumpkin"
            aria-label="Marcado como enviado"
          />
          <span className="font-sans text-xs text-parchment/60">Enviado</span>
        </label>
      </td>

      <td className="px-3 py-3 text-center align-top">
        <label className="inline-flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={invite.confirmed}
            onChange={() => handleToggle("confirmed")}
            disabled={busy}
            className="h-4 w-4 cursor-pointer accent-pumpkin"
            aria-label="Marcado como confirmado"
          />
          <span className="font-sans text-xs text-parchment/60">Confirmou</span>
        </label>
      </td>

      <td className="px-3 py-3 align-top">
        <div className="flex flex-wrap gap-1.5">
          <a
            href={buildWhatsAppUrl(whatsappText)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm border border-parchment/20 px-2.5 py-1 font-sans text-xs text-parchment/80 transition-colors hover:border-parchment hover:text-parchment"
            title="Abrir WhatsApp com mensagem pré-formatada"
          >
            💬 WhatsApp
          </a>
          <a
            href={buildMailtoUrl("", email.subject, email.body)}
            className="rounded-sm border border-parchment/20 px-2.5 py-1 font-sans text-xs text-parchment/80 transition-colors hover:border-parchment hover:text-parchment"
            title="Abrir cliente de email com mensagem pré-formatada"
          >
            ✉️ Email
          </a>
          <button
            type="button"
            onClick={handleCopy}
            disabled={busy}
            className="rounded-sm border border-parchment/20 px-2.5 py-1 font-sans text-xs text-parchment/80 transition-colors hover:border-parchment hover:text-parchment disabled:opacity-50"
            title="Copiar link do convite"
          >
            {copyState === "copied" ? "✓ Copiado" : copyState === "failed" ? "✗ Erro" : "🔗 Copiar"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={busy}
            className="rounded-sm border border-pumpkin-deep/60 px-2.5 py-1 font-sans text-xs text-pumpkin-deep transition-colors hover:bg-pumpkin-deep hover:text-parchment disabled:opacity-50"
            title="Excluir convite"
          >
            🗑️
          </button>
        </div>
      </td>
    </tr>
  );
}
