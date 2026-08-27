# Proposal: Sistema de Convites Digitais de Halloween

## 1. Visão Geral

Aplicação web (TanStack Start + Nitro) com duas visões:

- **Painel da Organizadora** (`/admin`) — CRUD de convidados, geração de
  link, ações de envio (WhatsApp/Email), marcação de RSVP.
- **Página do Convite** (`/?id=X&name=Y`) — visualizada pelo convidado.
  Envelope animado personalizado com o nome dele.

Uma única URL base serve todos os convidados: a personalização vem de
query params, sem deploy por convidado.

## 2. Decisões confirmadas (2026-08-27)

| Item | Decisão |
|---|---|
| Stack | TanStack Start + Nitro (já no projeto) |
| Deploy | Vercel (Nitro tem adapter oficial) |
| DB | Postgres no Neon (free tier 0.5GB, serverless-friendly) |
| ORM | Drizzle (TS-first, leve, schema declarativa) |
| Auth admin | Senha única (bcrypt) numa tabela `admin` |
| Sessão | Cookie httpOnly + token em tabela `sessions` |
| RSVP | Manual — dona marca "confirmou" no painel |
| Multi-tenant | Não (single organizadora) |

## 3. Por que essas escolhas

- **Postgres no Neon**: único Postgres serverless com DX boa + free tier
  generoso + driver HTTP (sem precisar de connection pool)
- **Drizzle**: schema compartilhada entre server functions e migrations,
  type-safe, sem runtime pesado
- **bcrypt + sessions no DB**: simples, revogação fácil (delete row),
  sem dep de OAuth lib
- **Sem multi-tenant**: complexidade de "quem é dono de qual invite" some.
  Uma festa, uma conta, fim

## 4. Estrutura da URL

| Rota | Quem acessa | O que vê |
|---|---|---|
| `/` | Qualquer | Landing com envelope fechado, clica pra abrir |
| `/?id=ABC123&name=Maria` | Convidado com link | Landing com nome "Maria" no envelope |
| `/admin/login` | Organizadora (não logada) | Form de login |
| `/admin` | Organizadora (logada) | Painel CRUD |
| `/admin/setup` | Primeira visita (sem admin) | Form de criar admin |

**Importante**: a página `/` com `?name=X` é o que cada convidado vê. O
painel `/admin` é totalmente separado e protegido por senha.

## 5. Schema (Postgres)

```sql
-- Único admin
CREATE TABLE admin (
  id          SERIAL PRIMARY KEY,
  username    TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,           -- bcrypt
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE invites (
  id          TEXT PRIMARY KEY,          -- 6-char alphanumeric (ex: "K7M2X9")
  name        TEXT NOT NULL,
  sent        BOOLEAN NOT NULL DEFAULT FALSE,
  confirmed   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sessions (
  id          TEXT PRIMARY KEY,          -- 32-char random token
  expires_at  TIMESTAMPTZ NOT NULL       -- default now() + 30 days
);

CREATE INDEX idx_sessions_expires ON sessions(expires_at);
```

## 6. Auth flow (simples)

1. **Primeira visita em `/admin`**: backend checa `admin` table. Se vazia,
   redireciona pra `/admin/setup` (form de criar admin)
2. **Login**: `POST /admin/login` (server function)
   - Valida username + password (bcrypt.compare)
   - Cria row em `sessions` com token random de 32 chars
   - Seta cookie `halloween-card-session=<token>` (httpOnly, secure, sameSite=lax, 30d)
3. **Acesso a `/admin`**: server function lê cookie, busca session no DB,
   verifica `expires_at > now()`. Se OK, mostra painel. Se não, redireciona
   pro login
4. **Logout**: deleta session do DB, clear cookie
5. **Sem rate limit, sem "esqueci senha"** — risco aceito

## 7. Server functions (API surface)

Tudo via `createServerFn` do TanStack Start (não precisa REST):

| Função | Args | Returns |
|---|---|---|
| `getCurrentAdmin` | — | `{ id, username }` ou `null` |
| `login` | `{ username, password }` | `{ ok: true }` ou erro |
| `logout` | — | `{ ok: true }` |
| `setupAdmin` | `{ username, password }` | `{ ok: true }` ou erro |
| `listInvites` | — | `Invite[]` |
| `createInvite` | `{ name }` | `Invite` |
| `updateInvite` | `{ id, sent?, confirmed? }` | `Invite` |
| `deleteInvite` | `{ id }` | `{ ok: true }` |

## 8. Páginas (rotas)

| Rota | Arquivo | O que faz |
|---|---|---|
| `/` | `src/routes/index.tsx` | Landing com envelope animado (existente) |
| `/admin` | `src/routes/admin/index.tsx` | Painel CRUD (auth required) |
| `/admin/login` | `src/routes/admin/login.tsx` | Form de login |
| `/admin/setup` | `src/routes/admin/setup.tsx` | Criar admin (só aparece se vazio) |

## 9. UI do painel (lista, não detalhada)

```
┌──────────────────────────────────────────────────────────┐
│  Convites de Halloween                       [Sair]      │
├──────────────────────────────────────────────────────────┤
│  [buscar...]  [Todos ▾]                  [+ Novo]        │
├──────────────────────────────────────────────────────────┤
│  Nome        │ Link          │ Enviado │ Confirmou │ Ações│
│  Maria       │ /?id=ABC&...  │ [✓]     │ [ ]       │ ✉️💬🗑️│
│  João        │ /?id=DEF&...  │ [ ]     │ [ ]       │ ✉️💬🗑️│
│  ...                                                     │
└──────────────────────────────────────────────────────────┘
```

**Ações por linha:**
- ✉️ Email → `mailto:?subject=Convite&body=...`
- 💬 WhatsApp → `https://wa.me/?text=...`
- 🗑️ Delete → confirma e deleta
- Toggle "Enviado" / "Confirmou" (checkbox inline)

## 10. Mensagens pré-formatadas

**WhatsApp:**
```
Olá {{nome}}! 🎃
Aqui está seu convite para a festa de Halloween:
{{link}}
31 de outubro, fantasia obrigatória. Te espero!
```

**Email:**
- Subject: "Convite — Festa de Halloween"
- Body: mesmo texto do WhatsApp

## 11. Variáveis de ambiente

```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
SESSION_SECRET=<random 64-char hex>  # opcional, pra futuro
```

Dev: apontar pro Neon (ou Postgres local se tiver)
Prod: apontar pro Neon via env no Vercel

## 12. O que NÃO está no escopo

- OAuth, magic link, recuperação de senha
- Multi-tenant (cada "dona" precisa do próprio deploy)
- Sincronização em tempo real entre devices
- Analytics / métricas
- Envio real de WhatsApp/email (só deep links que abrem o app)
- Testes automatizados (manual é suficiente pro escopo)
- i18n (PT-BR fixo)
- Migração de schema versionado (v1 fica v1 até quebrar)
- Rate limiting no login
- Refresh de sessão (renova só no próximo login)

## 13. Riscos conhecidos

| Risco | Mitigação |
|---|---|
| Neon free tier hiberna após inatividade (5 min) | Primeira request demora ~500ms; aceitável |
| Vercel function timeout (10s hobby) | Server functions são CRUD leve, OK |
| Senha fraca | Mínimo 8 chars no form, sem exigência extra |
| SQL injection | Drizzle usa prepared statements sempre |
| Cookie theft | httpOnly + secure (HTTPS) + sameSite=lax |
| Brute force no login | Sem rate limit aceito (risco baixo, "só uma festa") |
| SVG de 2.2MB | Aceito agora; otimizar antes de produção |
