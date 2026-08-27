# Halloween Card

Convite digital de Halloween com painel admin para a organizadora. A página
`/` mostra o envelope animado (com ou sem nome do convidado via URL);
`/admin` é a área protegida pra cadastrar convidados e gerar links de envio.

## Stack

- **Framework:** TanStack Start 1.168+ (file-based router, SSR via Nitro)
- **UI:** React 19, Tailwind CSS v4 (design tokens em `src/styles.css`)
- **Animações:** Motion (`motion/react`) — `useReducedMotion` respeitado
- **Lint/format:** ESLint flat config + Prettier
- **Lottie:** `lottie-react@^3` (aranhas andando no envelope aberto)
- **DB:** Postgres no [Neon](https://neon.tech) (free tier, serverless)
- **ORM:** Drizzle 0.45 com driver HTTP do Neon
- **Auth:** bcryptjs (cost 10) + cookie httpOnly + tabela `sessions`
- **IDs:** nanoid (6-char invite slug, 32-char session token)
- **Runtime:** Bun (lockfile `bun.lock`) ou npm (lockfile `package-lock.json`)

## Estrutura

```
src/
├── components/
│   ├── invitation/   # Embers, SpiderOverlay, WalkingSpider (Lottie)
│   ├── admin/        # InviteForm, InviteRow, StatusFilter
│   └── ui/           # shadcn primitives (botão, dialog, form, etc.)
├── hooks/
│   └── use-mobile.tsx
├── lib/
│   ├── id.ts         # nanoid wrappers (inviteId, sessionToken)
│   ├── messages.ts   # WhatsApp/Email message templates + URL builders
│   └── utils.ts
├── routes/
│   ├── __root.tsx
│   ├── index.tsx     # /              landing do convidado
│   └── admin/
│       ├── index.tsx # /admin         painel CRUD (auth)
│       ├── login.tsx # /admin/login   form de login
│       └── setup.tsx # /admin/setup   criar admin (1ª vez)
├── server/
│   ├── db/
│   │   ├── client.ts  # Drizzle + neon-http
│   │   └── schema.ts  # admin, invites, sessions
│   ├── auth/
│   │   ├── password.ts # hash + verify
│   │   ├── session.ts  # CRUD de sessions
│   │   └── cookie.ts   # get/set/clear cookie
│   └── functions/
│       ├── auth.ts     # setupAdmin, login, logout, getCurrentAdmin
│       └── invites.ts  # list/create/update/delete
├── styles.css         # @theme inline + tokens oklch + spooky-vignette
├── routeTree.gen.ts   # auto-gerado pelo Vite plugin (TanStack Router)
├── router.tsx
├── routeTree.gen.ts
├── server.ts
└── start.ts
drizzle/                # SQL migrations geradas
public/                 # assets estáticos (envelope-fechado.svg, envelope-aberto.svg, favicon, robots)
```

## Comandos

```powershell
bun install                 # instalar deps
bun run dev                 # vite dev (http://localhost:8080)
bun run build               # roda drizzle-kit migrate + vite build (auto-migra em prod)
bun run preview             # serve build
bun run lint                # eslint
bun run format              # prettier --write .
bun run db:generate         # drizzle-kit generate (cria nova migration)
bun run db:migrate          # drizzle-kit migrate (aplica no banco)
bun run db:studio           # drizzle-kit studio (UI pra ver dados)
bun run db:push             # drizzle-kit push (dev only)
```

Sem Bun? Use `npm` no lugar — os scripts são os mesmos.

## Setup local (primeira vez)

1. Crie uma conta e projeto no [Neon](https://console.neon.tech) (free tier).
2. Copie a **connection string** do projeto.
3. Crie um arquivo `.env` na raiz com:
   ```env
   DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
   ```
4. Rode:
   ```powershell
   bun run db:migrate       # cria as 3 tabelas no Neon
   bun run dev              # sobe o dev server em http://localhost:8080
   ```
5. Abra `http://localhost:8080/admin/setup` no navegador e crie o admin
   (username + senha ≥ 8 chars).
6. Você será logado automaticamente e levado ao painel.

## Setup deploy (Vercel)

1. Suba o repo pro GitHub (já está: `Rick-Henrique7/hallowen`).
2. Crie um projeto na [Vercel](https://vercel.com) e conecte ao repo.
3. Em **Settings > Environment Variables**, adicione:
   - `DATABASE_URL` = connection string do Neon
4. Deploy. O `npm run build` já roda `drizzle-kit migrate` antes do
   `vite build`, então o DB é migrado automaticamente.
5. Após o deploy, abra `https://<seu-app>.vercel.app/admin/setup` e crie
   o admin de produção.

## Arquitetura

```
                    ┌──────────────────────────┐
                    │  /admin/setup (1ª vez)   │
                    │  cria row em admin       │
                    └──────────┬───────────────┘
                               │
                               ▼
                    ┌──────────────────────────┐
                    │  /admin/login            │
                    │  bcrypt verify → cria    │
                    │  session → cookie httpOnly│
                    └──────────┬───────────────┘
                               │
                               ▼
                    ┌──────────────────────────┐
                    │  /admin (autenticado)    │
                    │  CRUD de invites         │
                    │  gera link ?id=X&name=Y  │
                    └──────────┬───────────────┘
                               │
                               │ envia via WhatsApp / email
                               ▼
                    ┌──────────────────────────┐
                    │  /?id=X&name=Maria       │
                    │  landing público         │
                    │  envelope animado + nome │
                    └──────────────────────────┘
```

A landing é 100% client-side: lê `?name` da URL, mostra o nome no envelope
aberto, sem chamar o servidor. A organizadora gerencia tudo via `/admin`.

## Convenções

- Cores semânticas em `src/styles.css` via `@theme inline` → use `bg-crimson`,
  `text-parchment`, `border-pumpkin-deep` etc. Não usar hex/oklch solto no JSX.
- Toda animação respeita `prefers-reduced-motion` — checar com `useReducedMotion()`.
- Componentes novos vão em `src/components/<escopo>/`.
- Server functions em `src/server/functions/<domínio>.ts` usando
  `createServerFn` de `@tanstack/react-start`.
- Toda mutação no DB passa por uma server function (validada com zod).
- Senha é bcrypt-hash (cost 10) antes de salvar.
- Cookie de sessão é `httpOnly`, `secure` em prod, `sameSite=lax`, 30 dias.

## Mudanças em mudanças (changes/)

Features grandes seguem o padrão SDD em `changes/NNN-nome/`:
- `proposal.md` — decisões e contexto
- `spec.md` — requisitos funcionais/não-funcionais e critérios de aceite
- `design.md` — arquitetura, schema, code skeleton
- `tasks.md` — checklist ordenado de implementação

Exemplo: `changes/001-invitation-system/`.

## Histórico

- 2026-08-25: importado de um template Lovable, desacoplado pra repo local
  (`Rick-Henrique7/hallowen` no GitHub).
- 2026-08-26: redesign visual — envelope SVG (Illustrator) no lugar do
  LetterCard HTML, paleta crimson, aranhas Lottie atravessando.
- 2026-08-27: painel admin (Fase 1-5) — Drizzle + Neon + auth + CRUD.
