export function buildInviteUrl(origin: string, id: string, name: string): string {
  const params = new URLSearchParams({ id, name });
  return `${origin}/?${params.toString()}`;
}

const MSG_TEMPLATE = (name: string, link: string) =>
  `Olá ${name}! 🎃\n\nAqui está seu convite para a festa de Halloween:\n${link}\n\n31 de outubro, fantasia obrigatória. Te espero!`;

export function formatWhatsApp(name: string, link: string): string {
  return MSG_TEMPLATE(name, link);
}

export function formatEmail(name: string, link: string): { subject: string; body: string } {
  return {
    subject: "Convite — Festa de Halloween",
    body: MSG_TEMPLATE(name, link),
  };
}

export function buildWhatsAppUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function buildMailtoUrl(to: string, subject: string, body: string): string {
  const params = new URLSearchParams({ subject, body });
  return `mailto:${to}?${params.toString()}`;
}
