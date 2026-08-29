# Spec: Guest Card Redesign (002)

## 1. Comportamento da Landing (`/`)

### 1.1 Estado inicial (sem JS ou antes do click)

- Fundo: `bg-crimson` (já tá)
- Vinheta `spooky-vignette` (já tá)
- Embers subindo (já tá)
- SpiderOverlay: 4 danglers no topo + 1 crawler embaixo (já tá, **mantém**)
- **Centralizado**: o PNG do envelope fechado que a designer mandar
  (atualmente é `envelope-fechado.svg`, será substituído)
- Focus ring visível em keyboard nav
- Hover: leve scale + lift (já tá)

### 1.2 Sequência de animação ao clicar (5 passos, total ~2s)

| Passo | Duração | O que acontece | Easing |
|---|---|---|---|
| 1 | 0.0–0.2s | Aba do envelope **abre** (rotateX 180° na aba de cima) | ease-out |
| 2 | 0.2–1.0s | **Carta sobe de dentro** do envelope + envelope **desce** até sumir pelo rodapé. As 2 animações em paralelo | carta: ease-out, envelope: ease-in |
| 3 | 0.8–1.4s | Carta **se expande** de 100% da largura do envelope pra ~75% do viewport | ease-in-out |
| 4 | 1.2–1.7s | Título "HALLOWEEN PARTY" entra com **efeito neon** (pisca 4-5× em laranja, estabiliza) | n/a (animação interna do título) |
| 5 | 1.6–2.0s | Conteúdo da carta aparece (Para [nome], QR placeholder) | fade-in ease-out |

**Estado final**: tela mostra a carta expandida, com:
- Botão "Fechar" no canto superior direito
- Título "HALLOWEEN PARTY" estabilizado em laranja neon
- "Para [nome]" se `?name=Maria` na URL
- QR code placeholder (você vai gerar depois)

### 1.3 Animação reversa (botão "Fechar")

Sequência inversa:
- Título some (fade-out)
- Carta encolhe (75% → 100% da largura do envelope original)
- Envelope **sobe** de volta do rodapé
- Carta **desce pra dentro** do envelope
- Aba do envelope fecha (rotateX 0°)
- Estado volta pro inicial

Reload da página também reseta pro estado inicial.

## 2. Componente da Carta (`src/components/invitation/CartaConvite.tsx`)

### 2.1 Props

```ts
type CartaConviteProps = {
  src: string;           // caminho do PNG (ex: "/carta.png")
  name?: string;         // nome do convidado (de ?name=X)
  onClose: () => void;   // callback do botão Fechar
};
```

### 2.2 Estrutura interna

```
<motion.div className="relative max-w-3xl w-[75vw]">  <!-- container -->
  <motion.img src={src} className="w-full bg-transparent" />
  <!-- overlay do "Para [nome]" -->
  {name && <div className="absolute top-X left-Y">Para {name}</div>}
  <!-- overlay do título neon -->
  <NeonTitle />  <!-- subcomponente -->
  <!-- placeholder do QR -->
  <div className="absolute bottom-X right-Y">[QR]</div>
  <!-- botão fechar -->
  <button onClick={onClose}>×</button>
</motion.div>
```

**Crítico**: a `<img>` deve ter `background: transparent` (CSS) ou não
ter background. Você alertou várias vezes sobre "background none na
div" — vou garantir explicitamente via className.

## 3. Componente do Título Neon (`src/components/invitation/NeonTitle.tsx`)

### 3.1 Comportamento

- Texto: "HALLOWEEN PARTY" em `font-display` (Pirata One)
- Cor inicial: `oklch(0.35 0.13 22)` (vermelho vinho apagado, mesma
  família do `--crimson-deep`)
- Após ~200ms na tela, **começa a piscar** em laranja neon
- Cada piscada: 80-150ms em `oklch(0.78 0.22 50)` (laranja neon vivo)
  e volta pro vinho
- 4-5 piscadas, depois estabiliza em laranja neon
- O texto todo tem **SVG filter** aplicado (`<feGaussianBlur>` +
  `<feMerge>`) pra dar o "glow" de neon

### 3.2 SVG filter (def inline no componente)

```jsx
<svg width="0" height="0" className="absolute">
  <defs>
    <filter id="neon-glow">
      <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
</svg>

<h1 style={{ filter: "url(#neon-glow)" }} className="...">
  HALLOWEEN PARTY
</h1>
```

### 3.3 JS controller (useEffect)

```ts
useEffect(() => {
  const intervals: number[] = [];
  // pisca 5× em 600ms
  for (let i = 0; i < 5; i++) {
    intervals.push(window.setTimeout(() => setNeon(true), 200 + i * 200));
    intervals.push(window.setTimeout(() => setNeon(false), 270 + i * 200));
  }
  return () => intervals.forEach(clearTimeout);
}, []);
```

Alternativa mais robusta: usar `useReducedMotion()` pra pular o
efeito se o usuário preferir movimento reduzido.

## 4. Admin — Bug Fixes (`src/routes/admin/index.tsx` + `src/components/admin/InviteRow.tsx`)

### 4.1 Toggle "Enviado" / "Confirmou" — Optimistic Update

**Problema**: hoje a UI só atualiza depois de `router.invalidate()` re-rodar
o loader, que faz roundtrip HTTP. Em DB lento = delay visível.

**Fix**:

```ts
function InviteRow({ invite, onChanged }) {
  const [optimisticInvite, setOptimisticInvite] = useState(invite);
  
  async function handleToggle(field) {
    const previous = optimisticInvite;
    const next = { ...optimisticInvite, [field]: !optimisticInvite[field] };
    setOptimisticInvite(next);  // update local IMEDIATAMENTE
    
    try {
      await updateInvite({ data: { id: next.id, [field]: next[field] } });
      onChanged();  // refetch loader em background
    } catch (err) {
      setOptimisticInvite(previous);  // reverter se falhar
      // mostrar erro
    }
  }
  
  // usar `optimisticInvite` em vez de `invite` no render
}
```

**Desabilitar** o checkbox enquanto a chamada tá em flight:

```tsx
<input
  type="checkbox"
  checked={optimisticInvite.sent}
  onChange={() => handleToggle("sent")}
  disabled={busy}
  ...
/>
```

### 4.2 Mobile Responsiveness

**Breakpoints**: usar `sm:` (640px) e `md:` (768px) do Tailwind.

**Tabela atual (problema)**:
```tsx
<table className="w-full table-fixed">
  <thead><tr><th>Convidado</th><th>Enviado</th><th>Confirmou</th><th>Ações</th></tr></thead>
  ...
</table>
```

**Fix**: em mobile, transformar **cada linha em um card** com stack vertical:

```tsx
<ul className="divide-y divide-parchment/10">
  {filtered.map(inv => (
    <li key={inv.id} className="p-4 sm:table-row">
      <div className="flex flex-col gap-3 sm:table-cell sm:align-top">
        <div>
          <p className="text-base text-parchment">{inv.name}</p>
          <p className="font-mono text-xs text-parchment/40">/?id={inv.id}</p>
        </div>
        <!-- toggles: 2 checkboxes lado a lado, grandes -->
        <div className="flex flex-wrap gap-4">
          <label className="flex min-h-[44px] items-center gap-2">
            <input type="checkbox" className="h-5 w-5 accent-pumpkin" />
            <span>Enviado</span>
          </label>
          <label className="flex min-h-[44px] items-center gap-2">
            <input type="checkbox" className="h-5 w-5 accent-pumpkin" />
            <span>Confirmou</span>
          </label>
        </div>
        <!-- ações: ícones grandes -->
        <div className="flex flex-wrap gap-2">
          <a className="min-h-[44px] rounded border px-4 py-2">💬 WhatsApp</a>
          <a className="min-h-[44px] rounded border px-4 py-2">✉️ Email</a>
          <button className="min-h-[44px] rounded border px-4 py-2">🔗 Copiar</button>
          <button className="min-h-[44px] rounded border px-4 py-2">🗑️</button>
        </div>
      </div>
    </li>
  ))}
</ul>
```

**Header do admin** responsivo:
```tsx
<header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <h1>Convites de Halloween</h1>
    <p>Logado como <strong>{user}</strong></p>
  </div>
  <button className="self-start sm:self-auto">Sair</button>
</header>
```

**Form de criar convite**: input + botão empilhados em mobile, lado a
lado em desktop:

```tsx
<form className="flex flex-col gap-2 sm:flex-row">
  <input className="flex-1 min-h-[44px] px-4 py-2" />
  <button className="min-h-[44px] px-5">+ Gerar</button>
</form>
```

## 5. Tasks (ordem de execução)

- [ ] **T-2.1**: Trocar `envelope-fechado.svg` e `envelope-aberto.svg`
      pelos PNGs da designer (você traz)
- [ ] **T-2.2**: Criar `src/components/invitation/CartaConvite.tsx`
      (container com img, overlay do nome, botão Fechar)
- [ ] **T-2.3**: Criar `src/components/invitation/NeonTitle.tsx`
      (componente com SVG filter inline + piscadas JS)
- [ ] **T-2.4**: Refatorar `src/routes/index.tsx` pra usar os novos
      componentes e orquestrar a sequência 5-passos
- [ ] **T-2.5**: Adicionar botões Voltar/Fechar com animação reversa
- [ ] **T-2.6**: Remover as 2 instâncias de `<WalkingSpider />` (você
      marcou como "ruins")
- [ ] **T-2.7**: Refatorar `InviteRow.tsx` com optimistic update
      + reversão em erro
- [ ] **T-2.8**: Refatorar `routes/admin/index.tsx` pra layout
      mobile-first (cards em vez de tabela)
- [ ] **T-2.9**: Ajustar tamanhos de toque (min-h-44, min-w-44) em
      inputs, checkboxes, botões
- [ ] **T-2.10**: Testar o toggle (deve ser instantâneo visual)
- [ ] **T-2.11**: Testar mobile (DevTools, viewport 375px)
- [ ] **T-2.12**: Commit + push
- [ ] **T-2.13**: (depois) gerar e integrar QR code por invite
- [ ] **T-2.14**: (depois) adicionar som de fundo

## 6. Out of Scope (re-confirmado)

- OAuth, magic link, password reset
- Multi-tenant
- Sincronização entre devices
- Analytics
- Testes automatizados
- i18n
- Schema versionado / migrations reversíveis

## 7. Critérios de aceite

- [ ] Click no envelope fechado inicia os 5 passos
- [ ] Envelope some e carta expande pra 75% da largura
- [ ] Título "HALLOWEEN PARTY" com efeito neon: piscadas + estabiliza
- [ ] Recarregar a página volta pro envelope fechado
- [ ] Botão "Fechar" anima reverso
- [ ] Imagem da carta tem **fundo transparente** (sem quadrado)
- [ ] Mobile (< 768px): painel admin sem sobreposição, botões ≥44px
- [ ] Toggle "Enviado" / "Confirmou" responde visualmente < 200ms
- [ ] Sem regressão no fluxo /admin/setup + /admin/login
- [ ] Lint + typecheck limpos
