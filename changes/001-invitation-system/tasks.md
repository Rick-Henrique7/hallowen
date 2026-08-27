# Tasks: Sistema de Convites Digitais de Halloween

## Phase 1 — Setup (deps + DB)

- [ ] **T-1.1** Instalar deps: `drizzle-orm`, `@neondatabase/serverless`, `bcryptjs`, `nanoid`, `drizzle-kit` (dev)
- [ ] **T-1.2** Criar `.env.example` com `DATABASE_URL`
- [ ] **T-1.3** Criar `drizzle.config.ts`
- [ ] **T-1.4** Criar `src/server/db/schema.ts` (admin, invites, sessions)
- [ ] **T-1.5** Criar `src/server/db/client.ts` (Drizzle + Neon)
- [ ] **T-1.6** Adicionar scripts: `db:generate`, `db:migrate`, `db:studio`
- [ ] **T-1.7** Criar Neon project, copiar `DATABASE_URL` pro `.env` local
- [ ] **T-1.8** Rodar `npm run db:generate` (cria arquivo de migration)
- [ ] **T-1.9** Rodar `npm run db:migrate` (aplica no Neon)
- [ ] **T-1.10** Verificar tabelas com `npm run db:studio` ou `psql`

## Phase 2 — Auth (server functions + setup + login + logout)

- [ ] **T-2.1** Criar `src/lib/id.ts` (generateInviteId, generateSessionToken)
- [ ] **T-2.2** Criar `src/server/auth/password.ts` (hashPassword, verifyPassword)
- [ ] **T-2.3** Criar `src/server/auth/session.ts` (createSession, validateSession, deleteSession, cleanupExpired)
- [ ] **T-2.4** Criar `src/server/auth/cookie.ts` (set/get/clear session cookie)
- [ ] **T-2.5** Criar `src/server/functions/auth.ts` (getCurrentAdmin, setupAdmin, login, logout)
- [ ] **T-2.6** Criar `src/routes/admin/setup.tsx` (form de criar admin, valida senha ≥ 8 chars)
- [ ] **T-2.7** Criar `src/routes/admin/login.tsx` (form de login)
- [ ] **T-2.8** Testar fluxo setup → login → admin page → logout end-to-end

## Phase 3 — Invites CRUD (server functions + list/create/update/delete)

- [ ] **T-3.1** Criar `src/server/functions/invites.ts` (list, create, update, delete)
- [ ] **T-3.2** Criar `src/lib/messages.ts` (buildInviteUrl, formatWhatsApp, formatEmail, buildWhatsAppUrl, buildMailtoUrl)
- [ ] **T-3.3** Criar `src/routes/admin/index.tsx` (loader: getCurrentAdmin, redirect se não logado)
- [ ] **T-3.4** Criar `src/components/admin/InviteForm.tsx` (form inline de criar)
- [ ] **T-3.5** Criar `src/components/admin/StatusFilter.tsx` (dropdown Todos/Pendentes/Enviados/Confirmados)
- [ ] **T-3.6** Criar `src/components/admin/InviteRow.tsx` (linha com nome, link, toggles, ações)
- [ ] **T-3.7** Implementar busca client-side (filtra por substring do nome)
- [ ] **T-3.8** Implementar filtro por status
- [ ] **T-3.9** Implementar ações: Copiar, Email (mailto), WhatsApp (wa.me), Toggle Enviado, Toggle Confirmou, Delete com confirm
- [ ] **T-3.10** Adicionar botão "Sair" no header (chama logout, redireciona pro login)
- [ ] **T-3.11** Testar CRUD completo end-to-end

## Phase 4 — Guest page (personalização via URL params)

- [ ] **T-4.1** Refatorar `src/routes/index.tsx` pra ler `search` params (id, name)
- [ ] **T-4.2** Exibir nome do convidado no envelope aberto (overlay de texto)
- [ ] **T-4.3** Testar `/` (sem params) — mostra genérico
- [ ] **T-4.4** Testar `/?id=ABC&name=Maria` — mostra "Maria"
- [ ] **T-4.5** Confirmar que aranhas e animações continuam funcionando

## Phase 5 — Polish & Deploy

- [ ] **T-5.1** Adicionar meta tags Open Graph dinâmicas em `/?id=X&name=Y` (og:title mostra "Convite para Maria")
- [ ] **T-5.2** Adicionar botão "voltar pro login" no `/admin` se sessão expirar
- [ ] **T-5.3** Empty state no painel: "Nenhum convite ainda. Crie o primeiro!"
- [ ] **T-5.4** Loading state nos botões (não double-submit no login/criar invite)
- [ ] **T-5.5** Adicionar `drizzle-kit migrate` no build script (auto-migrate no deploy)
- [ ] **T-5.6** Atualizar `AGENTS.md` com a nova arquitetura + comandos
- [ ] **T-5.7** Atualizar `README.md` com instruções de setup Neon + Vercel
- [ ] **T-5.8** Commit + push final
- [ ] **T-5.9** Deploy no Vercel (manual step do user)

## Out of scope (re-confirmado)

- OAuth, magic link, password reset
- Multi-tenant
- Sincronização entre devices
- Analytics
- Envio real de WhatsApp/email (só deep links)
- Testes automatizados
- i18n
- Schema versionado / migrations reversíveis
- Rate limiting
- Audit log / soft delete
