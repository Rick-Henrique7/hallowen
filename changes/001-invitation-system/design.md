# Design: Sistema de Convites Digitais de Halloween

## 1. Stack & Dependências

### Runtime
- TanStack Start 1.168+ (Nitro SSR)
- React 19
- TypeScript 5.8

### Novas dependências (a adicionar)
```jsonc
{
  "dependencies": {
    "drizzle-orm": "^0.36",           // ORM
    "@neondatabase/serverless": "^0.10", // driver HTTP Neon
    "bcryptjs": "^2.4",               // hash de senha (puro JS, sem native build)
    "nanoid": "^5",                   // ids curtos (6-char) e tokens (32-char)
  },
  "devDependencies": {
    "drizzle-kit": "^0.30",            // migrations
  }
}
```

**Por que `bcryptjs` e não `bcrypt`**: `bcrypt` tem binding nativo (node-gyp),
problema em serverless. `bcryptjs` é puro JS, ~30% mais lento mas suficiente
pra 1 login/admin.

**Por que `nanoid`**: gera ids com charset customizável (só `[A-Z0-9]`, 6 chars
= 2.18B combinações) e tokens seguros (32 chars).

## 2. Estrutura de Arquivos

```
src/
├── routes/
│   ├── __root.tsx
│   ├── index.tsx                    # landing do convidado (existente, refator leve)
│   └── admin/
│       ├── index.tsx                # painel CRUD (auth required)
│       ├── login.tsx                # form de login
│       └── setup.tsx                # criar admin (só se vazio)
├── components/
│   ├── invitation/
│   │   ├── Embers.tsx               # (existente)
│   │   ├── SpiderOverlay.tsx        # (existente)
│   │   └── WalkingSpider.tsx        # (existente)
│   └── admin/
│       ├── InviteForm.tsx           # form inline de criar invite
│       ├── InviteRow.tsx            # linha da tabela
│       └── StatusFilter.tsx         # filtro de status
├── server/
│   ├── db/
│   │   ├── client.ts                # Drizzle + Neon client
│   │   ├── schema.ts                # tabelas (admin, invites, sessions)
│   │   └── seed.ts                  # (opcional) seed inicial
│   ├── auth/
│   │   ├── session.ts               # create/validate/delete session
│   │   ├── password.ts              # hash + verify com bcrypt
│   │   └── cookie.ts                # get/set/clear session cookie
│   └── functions/
│       ├── auth.ts                  # setupAdmin, login, logout, getCurrentAdmin
│       └── invites.ts               # listInvites, createInvite, updateInvite, deleteInvite
├── lib/
│   ├── slug.ts                      # generateSlug() 6-char
│   ├── id.ts                        # generateSessionToken() 32-char
│   └── messages.ts                  # formatWhatsApp(), formatEmail()
└── styles.css                       # (existente, sem mudanças)

drizzle/                              # migrations geradas
├── 0000_initial.sql
.env                                   # DATABASE_URL=...
.env.example                           # template
drizzle.config.ts                      # config do drizzle-kit
```

## 3. Schema (Drizzle)

`src/server/db/schema.ts`:
```ts
import { pgTable, text, boolean, timestamp, serial } from "drizzle-orm/pg-core";

export const admin = pgTable("admin", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const invites = pgTable("invites", {
  id: text("id").primaryKey(),  // 6-char
  name: text("name").notNull(),
  sent: boolean("sent").notNull().default(false),
  confirmed: boolean("confirmed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),  // 32-char token
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
```

## 4. DB Client

`src/server/db/client.ts`:
```ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

**Por que `neon-http` e não `node-postgres`**: serverless-friendly (HTTP-based,
sem connection pool). Roda tanto em dev local quanto em Vercel prod.

## 5. Auth — Detalhes Técnicos

### 5.1 Senha (`src/server/auth/password.ts`)
```ts
import bcrypt from "bcryptjs";

const COST = 10;  // ~100ms por hash em hardware moderno

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, COST);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
```

### 5.2 Session (`src/server/auth/session.ts`)
```ts
import { db } from "@/server/db/client";
import { sessions } from "@/server/db/schema";
import { generateSessionToken } from "@/lib/id";
import { lt, eq } from "drizzle-orm";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function createSession(): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + THIRTY_DAYS_MS);
  await db.insert(sessions).values({ id: token, expiresAt });
  return token;
}

export async function validateSession(token: string): Promise<boolean> {
  const rows = await db
    .select({ expiresAt: sessions.expiresAt })
    .from(sessions)
    .where(eq(sessions.id, token))
    .limit(1);
  if (rows.length === 0) return false;
  return rows[0].expiresAt > new Date();
}

export async function deleteSession(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, token));
}

// Cleanup oportunista: deleta sessions expiradas quando
// o admin faz qualquer ação. Rodar cron real é overkill.
export async function cleanupExpired(): Promise<void> {
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}
```

### 5.3 Cookie (`src/server/auth/cookie.ts`)
```ts
import { getCookie, setCookie, deleteCookie } from "@tanstack/start/server";

const COOKIE_NAME = "halloween-card-session";
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 30 * 24 * 60 * 60,  // 30 dias em segundos
};

export function setSessionCookie(token: string) {
  setCookie(COOKIE_NAME, token, COOKIE_OPTS);
}

export function getSessionCookie(): string | null {
  return getCookie(COOKIE_NAME) ?? null;
}

export function clearSessionCookie() {
  deleteCookie(COOKIE_NAME, { path: "/" });
}
```

## 6. Server Functions (TanStack Start)

`src/server/functions/auth.ts`:
```ts
import { createServerFn } from "@tanstack/start";
import { db } from "@/server/db/client";
import { admin } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import {
  createSession,
  deleteSession,
  validateSession,
} from "@/server/auth/session";
import {
  setSessionCookie,
  getSessionCookie,
  clearSessionCookie,
} from "@/server/auth/cookie";

export const getCurrentAdmin = createServerFn({ method: "GET" }).handler(
  async () => {
    const token = getSessionCookie();
    if (!token) return null;
    const ok = await validateSession(token);
    if (!ok) return null;
    const rows = await db
      .select({ id: admin.id, username: admin.username })
      .from(admin)
      .limit(1);
    return rows[0] ?? null;
  }
);

export const setupAdmin = createServerFn({ method: "POST" })
  .validator((data: { username: string; password: string }) => data)
  .handler(async ({ data }) => {
    if (data.password.length < 8) {
      throw new Error("Senha deve ter no mínimo 8 caracteres");
    }
    const existing = await db.select().from(admin).limit(1);
    if (existing.length > 0) {
      throw new Error("Admin já existe");
    }
    const passwordHash = await hashPassword(data.password);
    await db.insert(admin).values({
      username: data.username,
      passwordHash,
    });
    return { ok: true };
  });

export const login = createServerFn({ method: "POST" })
  .validator((data: { username: string; password: string }) => data)
  .handler(async ({ data }) => {
    const rows = await db
      .select()
      .from(admin)
      .where(eq(admin.username, data.username))
      .limit(1);
    if (rows.length === 0) {
      throw new Error("Credenciais inválidas");
    }
    const ok = await verifyPassword(data.password, rows[0].passwordHash);
    if (!ok) {
      throw new Error("Credenciais inválidas");
    }
    const token = await createSession();
    setSessionCookie(token);
    return { ok: true };
  });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  const token = getSessionCookie();
  if (token) {
    await deleteSession(token);
    clearSessionCookie();
  }
  return { ok: true };
});
```

`src/server/functions/invites.ts` (similar — list, create, update, delete)

## 7. Lib utilities

`src/lib/id.ts`:
```ts
import { customAlphabet } from "nanoid";

// Exclui 0/O, 1/I/L pra evitar confusão em URL/visual
const SLUG_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const slug = customAlphabet(SLUG_ALPHABET, 6);

export function generateInviteId(): string {
  return slug();
}

const TOKEN_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const token = customAlphabet(TOKEN_ALPHABET, 32);

export function generateSessionToken(): string {
  return token();
}
```

`src/lib/messages.ts`:
```ts
export function buildInviteUrl(origin: string, id: string, name: string): string {
  const params = new URLSearchParams({ id, name });
  return `${origin}/?${params.toString()}`;
}

export function formatWhatsApp(name: string, link: string): string {
  return `Olá ${name}! 🎃\n\nAqui está seu convite para a festa de Halloween:\n${link}\n\n31 de outubro, fantasia obrigatória. Te espero!`;
}

export function formatEmail(name: string, link: string): { subject: string; body: string } {
  return {
    subject: "Convite — Festa de Halloween",
    body: formatWhatsApp(name, link),
  };
}

export function buildWhatsAppUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function buildMailtoUrl(to: string, subject: string, body: string): string {
  const params = new URLSearchParams({ subject, body });
  return `mailto:${to}?${params.toString()}`;
}
```

## 8. Componente `Admin/index.tsx` (alto nível)

```tsx
// src/routes/admin/index.tsx
import { createServerFn } from "@tanstack/start";
import { getCurrentAdmin } from "@/server/functions/auth";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
  beforeLoad: async () => {
    const admin = await getCurrentAdmin();
    if (!admin) throw redirect({ to: "/admin/login" });
  },
  component: AdminPanel,
});

function AdminPanel() {
  // Search params: ?q= (busca), ?status= (filtro)
  // Lista de invites via useLoaderData (server function)
  // Form de criar inline
  // Tabela com InviteRow
  return (...);
}
```

## 9. Migrations

`drizzle.config.ts`:
```ts
import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

Comandos:
```powershell
# Gerar migration após mudança no schema
bunx drizzle-kit generate

# Aplicar migrations (roda no build/start do Nitro via hook)
bunx drizzle-kit migrate
```

Para Vercel: rodar `bunx drizzle-kit migrate` como build step no `package.json`:
```jsonc
"scripts": {
  "build": "drizzle-kit migrate && vite build",
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:studio": "drizzle-kit studio"
}
```

## 10. Env vars

`.env.example`:
```env
DATABASE_URL=postgresql://user:password@host/db?sslmode=require
```

Vercel: Settings > Environment Variables > adicionar `DATABASE_URL` apontando
pro Neon. Tanto prod quanto preview.

## 11. Primeiro deploy — checklist

1. Criar conta Neon (https://neon.tech, free tier)
2. Criar projeto, copiar `DATABASE_URL`
3. Adicionar no `.env` local + Vercel env vars
4. Rodar `npm run db:migrate` local (cria tabelas)
5. Acessar `/admin/setup`, criar admin
6. Deploy Vercel via GitHub
7. Verificar `/admin/login` em prod, logar
8. Criar invites, gerar links, testar WhatsApp/Email
9. Testar `/` (sem params) e `/?id=X&name=Maria`

## 12. Limites / Não-objetivos (re-confirmados)

- Sem OAuth, magic link
- Sem multi-tenant
- Sem sync entre devices
- Sem rate limit
- Sem testes automatizados
- Sem auditoria / soft delete
- Sem migração reversível
- Sem refresh de sessão automática (só no próximo login)
- Sem internacionalização
