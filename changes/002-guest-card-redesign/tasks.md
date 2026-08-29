# Tasks: Guest Card Redesign (002)

## Phase 1 — Aguardando assets da designer

- [ ] **T-2.0a** Você me manda:
  - PNG do envelope fechado (substitui `envelope-fechado.svg`)
  - PNG do envelope aberto OU PNG da carta (fundo transparente)
  - Confirmar se quer 1 PNG (carta com envelope integrado) ou 2
    PNGs (carta sai de dentro do envelope separado)

**Aguardando**. Não inicio código até receber.

## Phase 2 — Animação da landing (deps: PNGs da Phase 1)

- [ ] **T-2.1** Criar `src/components/invitation/CartaConvite.tsx`
      (container com img, overlay do nome, botão Fechar)
- [ ] **T-2.2** Criar `src/components/invitation/NeonTitle.tsx`
      (componente com SVG filter inline + piscadas JS)
- [ ] **T-2.3** Criar `src/components/invitation/EnvelopeSequence.tsx`
      (orquestrador dos 5 passos + animação reversa)
- [ ] **T-2.4** Refatorar `src/routes/index.tsx` pra usar
      EnvelopeSequence no lugar do AnimatePresence atual
- [ ] **T-2.5** Adicionar botão "Fechar" com callback reverse
- [ ] **T-2.6** Remover 2 instâncias de `<WalkingSpider />` dentro
      do envelope (você marcou como "ruins")
- [ ] **T-2.7** Investigar e FIXAR de vez o "quadrado de fundo" ao
      redor do envelope (background-none explícito na img)
- [ ] **T-2.8** Substituir `envelope-fechado.svg`/`envelope-aberto.svg`
      pelos PNGs novos em `public/`
- [ ] **T-2.9** Lint + typecheck + commit + push

## Phase 3 — Admin: bug fixes (independente dos assets)

- [ ] **T-3.1** Refatorar `InviteRow.tsx` com optimistic update:
      - `useState(invite)` pra ter cópia local
      - update imediato antes de chamar server function
      - reverter se falhar
      - desabilitar checkbox durante flight
- [ ] **T-3.2** Refatorar `routes/admin/index.tsx`:
      - `<table>` → `<ul>` de cards
      - em `sm:` (≥640px), vira table-row de novo (grid)
- [ ] **T-3.3** Aplicar min-h-[44px] em todos os controles
      interativos (input, button, checkbox)
- [ ] **T-3.4** Header responsivo (flex-col em mobile)
- [ ] **T-3.5** Form de criar convite responsivo
      (input + botão empilhados em mobile)
- [ ] **T-3.6** Lint + typecheck + commit + push

## Phase 4 — Polish (depois de Phase 2+3)

- [ ] **T-4.1** Gerar QR code por invite (lib `qrcode` ou similar)
- [ ] **T-4.2** Adicionar som de fundo (asset pendente)
- [ ] **T-4.3** Open Graph dinâmico por invite (compartilhamento em
      redes sociais com preview personalizado)
- [ ] **T-4.4** Teste de acessibilidade (keyboard nav, screen reader,
      focus trap no modal do QR)

## Phase 5 — Deploy

- [ ] **T-5.1** Você conecta repo na Vercel (se já não conectou)
- [ ] **T-5.2** Adiciona `DATABASE_URL` no Vercel env (sem `postgresql:`
      duplicado)
- [ ] **T-5.3** Deploy automático (build roda drizzle migrate)
- [ ] **T-5.4** Cria admin de prod em `https://<app>/admin/setup`

## Out of Scope (re-confirmado)

- OAuth, magic link, password reset
- Multi-tenant
- Sincronização entre devices
- Analytics
- Testes automatizados
- i18n
- Schema versionado / migrations reversíveis

## Blocker atual

**T-2.0a** — aguardando você trazer os PNGs da designer. Sem isso,
Phase 2 não pode começar (a animação precisa saber as dimensões e
quantos PNGs usar).

Phase 3 (admin mobile + optimistic) é **independente** dos assets e
pode ser feito em paralelo se você quiser — me avisa.
