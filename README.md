# Halloween Card 🎃

Convite digital animado de Halloween com painel admin pra organizadora
gerenciar a lista de convidados, gerar links personalizados de
WhatsApp/email e marcar quem confirmou presença.

- **Landing pública** (`/`) — carta animada (fechada → aberta → convite
  com nome do convidado via `?id=N&name=Maria`)
- **Painel admin** (`/admin`) — login com senha, CRUD de convidados,
  ações de envio (WhatsApp/email/copy), marcação de RSVP

## Badges

![Status](https://img.shields.io/badge/status-em%20produ%C3%A7%C3%A3o-success?style=flat-square)
![Stack](https://img.shields.io/badge/stack-TanStack%20Start%20%2B%20React%2019-blue?style=flat-square)
![Deploy](https://img.shields.io/badge/deploy-Vercel-black?style=flat-square&logo=vercel&logoColor=white)
![Database](https://img.shields.io/badge/db-Neon%20Postgres-00E599?style=flat-square&logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-lightgrey?style=flat-square)
![Language](https://img.shields.io/github/languages/top/Rick-Henrique7/hallowen?style=flat-square)

## Funcionalidades

|                           |                                                                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 🎴 **Landing animada**    | Carta fechada → aberta → convite com nome centralizado, aranhas balançando, brasas subindo, lottie de "click" no canto inferior direito |
| 🔐 **Admin auth**         | bcrypt cost 10, sessão em cookie `httpOnly` (30 dias), tabelas `admin` + `sessions` no Postgres                                         |
| 👥 **CRUD de convidados** | Criar com nome livre, gerar `id` auto-increment, copiar link, enviar via WhatsApp/email, marcar enviado/confirmado                      |
| 📱 **Responsivo**         | Convite 85vw no mobile (374px num iPhone 16 Pro Max), 40vw no desktop                                                                   |
| ♿ **Reduced motion**     | Animações Motion respeitam `prefers-reduced-motion`                                                                                     |
| 🚀 **Deploy zero-config** | `npm run build` roda `drizzle-kit migrate` + `vite build (preset: vercel)`, sai `.vercel/output/` pronto                                |
| 🛠️ **Recovery CLI**       | `npx tsx scripts/create-admin.ts <user> <pass>` recria admin direto no banco                                                            |

## Arquitetura

```
   ┌─────────────────────────────────────────────────────────────────┐
   │                     🌐 Browser do convidado                     │
   │   abre https://app/?id=1&name=Maria                              │
   └─────────────────────────────┬───────────────────────────────────┘
                                 │  (100% client-side — lê ?name da URL)
                                 ▼
   ┌─────────────────────────────────────────────────────────────────┐
   │  /  (TanStack Start SSR)                                         │
   │  ┌─────────────┐   click    ┌──────────────┐   slide out        │
   │  │ carta       │ ─────────► │ carta aberta │ ─────────────┐    │
   │  │ fechada     │            │              │              │    │
   │  └─────────────┘            └──────┬───────┘              │    │
   │                                    │ 350ms depois          │    │
   │                                    ▼                       │    │
   │                              ┌──────────────┐              │    │
   │                              │ convite      │◄─────────────┘    │
   │                              │ (verso/      │  900ms HOLD        │
   │                              │  frente)     │                   │
   │                              └──────────────┘                   │
   │                                    │                            │
   │                                    ▼ click flip                 │
   │                              scaleX: 1 → -1 → 1  (650ms)       │
   └─────────────────────────────────────────────────────────────────┘

   ┌─────────────────────────────────────────────────────────────────┐
   │                   🔐 Painel admin (/admin)                      │
   │                                                                  │
   │   ┌──────────┐    bcrypt     ┌──────────┐   cookie httpOnly     │
   │   │ /login   │ ────────────► │ sessions │ ─────────────────►    │
   │   └──────────┘   verify      │ table    │   30 dias             │
   │                                └──────────┘                      │
   │                                     │                            │
   │                                     ▼                            │
   │   ┌──────────────────────────────────────────────────────┐      │
   │   │  CRUD de invites (Drizzle ORM + Neon HTTP driver)    │      │
   │   │  • criar  • toggle sent/confirmed  • delete         │      │
   │   │  • gerar link  ?id=N&name=X                         │      │
   │   └──────────────────────────────────────────────────────┘      │
   └─────────────────────────────┬───────────────────────────────────┘
                                 │
                                 │  wa.me / mailto
                                 ▼
                          📱 WhatsApp / ✉️ Email do convidado
                                 │
                                 │  convidado clica no link
                                 ▼
                          volta pro topo do diagrama 🌐

   ┌─────────────────────────────────────────────────────────────────┐
   │   💾 Neon Postgres (free tier, serverless via HTTP driver)      │
   │                                                                  │
   │   ┌──────────┐   ┌───────────┐   ┌──────────┐                   │
   │   │  admin   │   │  invites  │   │ sessions │                   │
   │   │──────────│   │───────────│   │──────────│                   │
   │   │ id (ser) │   │ id (ser)  │   │ token    │                   │
   │   │ username │   │ name      │   │ adminId  │                   │
   │   │ password │   │ sent      │   │ expiresAt│                   │
   │   │ _hash    │   │ confirmed │   │          │                   │
   │   │ createdAt│   │ createdAt │   │          │                   │
   │   └──────────┘   └───────────┘   └──────────┘                   │
   └─────────────────────────────────────────────────────────────────┘
```

A landing é **100% client-side**: lê `?name` da URL, mostra o nome no
convite, sem chamar o servidor. A organizadora gerencia tudo via
`/admin`.

## Stack

- **Framework:** [TanStack Start](https://tanstack.com/start) 1.168+
  (file-based router, SSR via Nitro 3.0)
- **UI:** React 19, Tailwind CSS v4 (design tokens em `src/styles.css`)
- **Animações:** [Motion](https://motion.dev) — `useReducedMotion` respeitado
- **Lottie:** `lottie-react@^3` (lazy-loaded, ~250KB cortado do bundle inicial)
- **DB:** Postgres no [Neon](https://neon.tech) (free tier, serverless HTTP)
- **ORM:** Drizzle 0.45 com driver HTTP do Neon
- **Auth:** bcryptjs (cost 10) + cookie `httpOnly` + tabela `sessions`
- **Deploy:** Vercel (preset Nitro → `.vercel/output/`)

## Quick start (local)

```powershell
# 1. Crie .env com a connection string do Neon
echo "DATABASE_URL=postgresql://user:pass@host/db?sslmode=require" > .env

# 2. Instale deps
bun install        # ou npm install

# 3. Migre o schema (cria as 3 tabelas no Neon)
bun run db:migrate # ou npm run db:migrate

# 4. Suba o dev server
bun run dev        # http://localhost:8080

# 5. Crie o admin
# Abra http://localhost:8080/admin/setup
# (username + senha ≥ 8 chars)
```

> **Esqueceu a senha do admin?** Rode `npx tsx scripts/create-admin.ts <user> <pass>`
> de dentro da pasta do projeto (precisa do `.env` com `DATABASE_URL`).

## Deploy (Vercel)

1. **Import** o repo [`Rick-Henrique7/hallowen`](https://github.com/Rick-Henrique7/hallowen)
   na [Vercel](https://vercel.com)
2. Framework Preset: **TanStack Start** (auto-detectado)
3. **Settings → Environment Variables** → adicionar `DATABASE_URL` (Neon)
4. Deploy. O `npm run build` roda `drizzle-kit migrate && vite build`,
   então o DB é migrado automaticamente a cada push.
5. Abre `https://<app>.vercel.app/admin/login` com a credencial criada
   via `scripts/create-admin.ts` (ou `/admin/setup` se o banco ainda
   não tem admin).

## Como usar (organizadora)

1. Acesse `/admin/login`
2. Crie convidados no painel (nome + "Gerar")
3. Use os botões da linha pra:
   - 💬 **WhatsApp** — abre wa.me com mensagem pré-formatada
   - ✉️ **Email** — abre mailto com assunto + corpo preenchidos
   - 🔗 **Copiar** — copia o link pro clipboard
   - ✅ **Enviado** / **Confirmou** — toggles
   - 🗑️ **Excluir** — remove o convidado
4. Cada link tem o formato `https://<app>/?id=1&name=Maria`
5. O convidado abre o link, vê o convite com "Maria" centralizado em
   laranja abóbora, clica pra abrir, e as aranhas balançam na cena

## Variáveis de ambiente

| Var            | Descrição                                                 | Onde conseguir                                                                                             |
| -------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL` | Postgres connection string (Neon, com `?sslmode=require`) | [console.neon.tech](https://console.neon.tech) → New Project → Copy (use **Pooled connection** pra Vercel) |

## Estrutura

```
hallowen-card/
├── public/                    # assets estáticos commitados
│   ├── carta-fechada.svg      # envelope/carta fechada (1.51 W/H)
│   ├── carta-aberta.svg       # carta aberta (1.51 W/H)
│   ├── convite-frente.jpg     # frente do convite (0.71 W/H)
│   ├── convite-verso.jpg      # verso do convite (0.71 W/H)
│   ├── click.json             # Lottie do hint "click"
│   └── favicon.ico, robots.txt
├── scripts/
│   └── create-admin.ts        # CLI de recovery do admin
├── drizzle/                   # SQL migrations geradas
├── src/
│   ├── components/
│   │   ├── invitation/        # Embers, SpiderOverlay, WalkingSpider
│   │   ├── admin/             # InviteForm, InviteRow, StatusFilter
│   │   └── ui/                # shadcn primitives
│   ├── routes/
│   │   ├── index.tsx          # / landing público
│   │   └── admin/             # /admin, /admin/login, /admin/setup
│   ├── api/                   # server functions (Drizzle + auth + invites)
│   ├── lib/                   # id (nanoid), messages (WA/email templates)
│   └── styles.css             # @theme inline + tokens oklch
├── changes/                   # SDD (proposal + spec + design + tasks)
│   ├── 001-invitation-system/
│   └── 002-guest-card-redesign/
├── vercel.json                # build/install/output config
├── vite.config.ts             # Nitro preset: vercel
├── drizzle.config.ts
└── package.json
```

Convenções completas e detalhes técnicos em
[`AGENTS.md`](./AGENTS.md).

## SDD (Spec-Driven Development)

Mudanças grandes ficam em `changes/NNN-nome/` com 4 artefatos:

- `proposal.md` — decisões e contexto
- `spec.md` — requisitos funcionais/não-funcionais e critérios de aceite
- `design.md` — arquitetura, schema, code skeleton
- `tasks.md` — checklist ordenado

Exemplo: `changes/002-guest-card-redesign/`. Invariantes visuais
(proporções da carta, paletas) ficam documentados como **constraints
não-funcionais** em §7 da spec — qualquer troca de asset da carta
precisa preservar o aspect ratio calibrado.
