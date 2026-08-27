# Halloween Card 🎃

Convite digital animado de Halloween com painel admin pra organizadora
gerenciar a lista de convidados, gerar links personalizados de WhatsApp/email
e marcar quem confirmou presença.

- **Landing pública** (`/`) — envelope animado com ou sem nome do convidado
  via `?name=Maria&id=ABC123`
- **Painel admin** (`/admin`) — login com senha, CRUD de convidados, ações
  de envio (WhatsApp/email/copy), marcação de RSVP

## Stack

TanStack Start + React 19 + Tailwind v4 + Motion + Drizzle ORM + Postgres (Neon)
+ Lottie + bcryptjs. Detalhes em [`AGENTS.md`](./AGENTS.md).

## Quick start (local)

```powershell
# 1. Crie .env com a connection string do Neon
echo "DATABASE_URL=postgresql://user:pass@host/db?sslmode=require" > .env

# 2. Instale deps
bun install        # ou npm install

# 3. Migre o schema
bun run db:migrate # ou npm run db:migrate

# 4. Suba o dev server
bun run dev        # http://localhost:8080

# 5. Crie o admin
# Abra http://localhost:8080/admin/setup
```

## Deploy (Vercel)

1. Conecte o repo `Rick-Henrique7/hallowen` na Vercel
2. Adicione a env var `DATABASE_URL` (Neon)
3. Deploy — o build script roda `drizzle-kit migrate` automaticamente
4. Crie o admin de produção em `https://<app>.vercel.app/admin/setup`

## Como usar (organizadora)

1. Acesse `/admin/login` (ou `/admin/setup` na primeira vez)
2. Crie convidados no painel (nome + "Gerar")
3. Use os botões da linha pra:
   - 💬 **WhatsApp** — abre wa.me com mensagem pré-formatada
   - ✉️ **Email** — abre mailto com assunto + corpo preenchidos
   - 🔗 **Copiar** — copia o link pro clipboard
   - ✅ **Enviado** / **Confirmou** — toggles
   - 🗑️ **Excluir** — remove o convidado
4. Cada link tem o formato `https://<app>/?id=ABC123&name=Maria`
5. O convidado abre o link, vê o envelope com "Para Maria", clica pra
   abrir, e as aranhas andam dentro

## Variáveis de ambiente

| Var | Descrição | Onde conseguir |
|---|---|---|
| `DATABASE_URL` | Postgres connection string | [console.neon.tech](https://console.neon.tech) → New Project → Copy |

## Estrutura

Ver [`AGENTS.md`](./AGENTS.md) pra árvore completa de pastas, comandos e
convenções. Mudanças grandes ficam documentadas em `changes/NNN-nome/`
(SDD: `proposal.md` + `spec.md` + `design.md` + `tasks.md`).
