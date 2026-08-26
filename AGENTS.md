# Halloween Card

Convite animado de Halloween — TanStack Start + React 19 + Tailwind v4 +
Motion. O envelope abre, a carta sobe, e detalhes como brasas, aranhas e
moldura ornamentada dão o clima.

## Stack

- **Framework:** TanStack Start (file-based router, SSR via Nitro)
- **UI:** React 19, Tailwind CSS v4 (design tokens em `src/styles.css`)
- **Animações:** Motion (`motion/react`) — `useReducedMotion` respeitado
- **Lint/format:** ESLint flat config + Prettier
- **Runtime:** Bun (lockfile `bun.lock`) — também tem `package-lock.json`
  porque o projeto veio de um setup Lovable/npm, ambos funcionam

## Estrutura

```
src/
├── components/
│   ├── invitation/   # Envelope, LetterCard, OrnateFrame, Embers, SpiderOverlay
│   └── ui/           # shadcn primitives (botão, dialog, form, etc.)
├── hooks/
│   └── use-mobile.tsx
├── lib/              # error-capture, error-page, utils
├── routes/           # TanStack file routes (root + index)
├── styles.css        # @theme inline + tokens oklch
├── router.tsx
├── routeTree.gen.ts
├── server.ts
└── start.ts
public/               # assets estáticos servidos pelo Nitro
```

## Comandos

```powershell
bun install                  # instalar deps
bun run dev                  # vite dev (http://localhost:3000)
bun run build                # produção
bun run preview              # servir build
bun run lint                 # eslint
bun run format               # prettier --write .
```

Sem Bun? Use `npm` no lugar — os scripts são os mesmos.

## Convenções

- Cores semânticas em `src/styles.css` via `@theme inline` → use `bg-parchment`,
  `text-witch-deep`, `border-pumpkin-deep` etc. Não usar hex/oklch solto no JSX.
- Toda animação respeita `prefers-reduced-motion` — checar com `useReducedMotion()`.
- Componentes novos vão em `src/components/invitation/` (escopo do convite)
  ou `src/components/ui/` (primitivos reutilizáveis).
- Head metadata por rota: `head: () => ({ meta: [...] })` no `createFileRoute`.

## Histórico

Projeto importado de um template Lovable em 2026-08-25 e desacoplado para
desenvolvimento local independente. O `.git` original (apontava para um
worktree Nix) foi substituído por um repositório local; o estado anterior
fica em `.git.old` e os metadados Lovable em `.lovable.old/` (ambos
ignorados). Para limpar depois:

```powershell
Remove-Item .git.old, .lovable.old, .workspace.old -Recurse -Force
```
