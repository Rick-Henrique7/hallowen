# Design: Guest Card Redesign (002)

## Arquitetura

```
                              ┌──────────────────┐
                              │   /admin/setup    │
                              │   (1ª vez)        │
                              └────────┬─────────┘
                                       │ cria admin
                                       ▼
                              ┌──────────────────┐
                              │   /admin/login   │
                              │   bcrypt + cookie│
                              └────────┬─────────┘
                                       │
                                       ▼
                       ┌────────────────────────────┐
                       │  /admin (CRUD)             │
                       │  - InviteForm              │
                       │  - InviteRow (optimistic!) │
                       │  - StatusFilter            │
                       │  - mobile-first            │
                       └────────────┬───────────────┘
                                    │ gera link
                                    │   /?id=X&name=Maria
                                    ▼
                       ┌────────────────────────────┐
                       │  /  (guest landing)        │
                       │                            │
                       │  estado 1: PNG envelope    │
                       │          fechado           │
                       │            ↓ click         │
                       │  estado 2: aba abre        │
                       │            ↓ 0.2s          │
                       │  estado 3: carta sai de    │
                       │          dentro + envelope │
                       │          desce e some      │
                       │            ↓ 0.8s          │
                       │  estado 4: carta expande   │
                       │          75% largura       │
                       │            ↓ 0.6s          │
                       │  estado 5: título neon     │
                       │          pisca + estabiliza│
                       │            ↓ 0.4s          │
                       │  estado 6: FIM             │
                       │  (Para [nome], QR, Fechar)│
                       └────────────────────────────┘
```

## File structure (novos / modificados)

```
src/
├── components/invitation/
│   ├── CartaConvite.tsx           (NEW) container da carta PNG
│   ├── NeonTitle.tsx              (NEW) título com efeito neon
│   ├── EnvelopeSequence.tsx       (NEW) orquestra os 5 passos
│   ├── WalkingSpider.tsx          (mantido, mas NÃO usado na carta)
│   ├── SpiderOverlay.tsx          (mantido, background da landing)
│   ├── Embers.tsx                 (mantido)
│   └── Envelope.tsx               (REMOVER, virou inútil)
│
├── routes/
│   ├── index.tsx                  (REWRITE) usa os novos componentes
│   └── admin/
│       ├── index.tsx              (REWRITE) mobile-first, cards
│       ├── login.tsx              (refactor: mobile-friendly)
│       └── setup.tsx              (refactor: mobile-friendly)
│
├── components/admin/
│   ├── InviteForm.tsx             (refactor: botões maiores)
│   ├── InviteRow.tsx              (refactor: optimistic update)
│   └── StatusFilter.tsx           (refactor: full-width mobile)
│
└── public/
    ├── envelope-fechado.png        (NEW, da designer)
    ├── envelope-aberto.png         (NEW, da designer) — ou pode ser
    │                                dispensável se a carta cobrir
    ├── carta.png                   (NEW, da designer) — fundo transparente
    └── envelope-fechado.svg        (REMOVER depois de trocar)
        envelope-aberto.svg         (REMOVER depois de trocar)
```

## Estado da animação

Pra orquestrar a sequência de 5 passos, vou usar um **state machine**
simples no `EnvelopeSequence.tsx`:

```ts
type Phase = "closed" | "opening" | "letter-rising" | "letter-expand" | "neon" | "open";

const [phase, setPhase] = useState<Phase>("closed");

async function handleClick() {
  if (phase !== "closed") return;
  setPhase("opening");
  await wait(200); setPhase("letter-rising");
  await wait(600); setPhase("letter-expand");
  await wait(400); setPhase("neon");
  // title's useEffect triggers the flicker when phase === "neon"
  await wait(400); setPhase("open");
}
```

A carta (CartaConvite) só renderiza quando `phase !== "closed"`.
O envelope PNG só renderiza quando `phase === "closed"`.
Ambos coexistem brevemente em `letter-rising` (carta subindo +
envelope descendo) com `AnimatePresence`.

## CartaConvite (componente)

```tsx
type CartaConviteProps = {
  src: string;            // "/carta.png"
  name?: string;
  onClose: () => void;
  visible: boolean;       // controla a animação de entrada/saída
};

export function CartaConvite({ src, name, onClose, visible }: CartaConviteProps) {
  return (
    <motion.div
      initial={visible ? { scale: 0.4, y: 80, opacity: 0 } : false}
      animate={visible ? { scale: 1, y: 0, opacity: 1 } : { scale: 0.4, y: 80, opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-[75vw] max-w-3xl"  // responsivo: 75% da largura
    >
      {/* container SEM background. O PNG é a carta. */}
      <div className="relative bg-transparent">
        <img
          src={src}
          alt="Convite de Halloween"
          className="block h-auto w-full bg-transparent"
          draggable={false}
        />
        {/* overlay: nome do convidado */}
        {name && (
          <div className="absolute top-[10%] left-0 right-0 text-center">
            <p className="font-serif text-parchment">Para</p>
            <h2 className="font-display text-3xl text-parchment">{name}</h2>
          </div>
        )}
        {/* título neon (subcomponente) */}
        <NeonTitle />
        {/* placeholder do QR */}
        <div className="absolute bottom-[10%] right-[10%] h-24 w-24 border border-dashed border-parchment/50" />
        {/* botão Fechar */}
        <button
          onClick={onClose}
          aria-label="Fechar convite"
          className="absolute top-2 right-2 h-11 w-11 rounded-full bg-soot/60 text-parchment hover:bg-soot"
        >
          ×
        </button>
      </div>
    </motion.div>
  );
}
```

## NeonTitle (componente)

```tsx
export function NeonTitle() {
  const [neon, setNeon] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const intervals: ReturnType<typeof setTimeout>[] = [];
    // pisca 5×: alterna vinho ↔ laranja neon a cada 150ms
    for (let i = 0; i < 5; i++) {
      intervals.push(setTimeout(() => setNeon(true), 200 + i * 250));
      intervals.push(setTimeout(() => setNeon(false), 270 + i * 250));
    }
    // última piscada: estabiliza em laranja neon
    intervals.push(setTimeout(() => setNeon(true), 200 + 5 * 250));
    return () => intervals.forEach(clearTimeout);
  }, [reduced]);

  const color = neon ? "oklch(0.78 0.22 50)" : "oklch(0.35 0.13 22)";

  return (
    <>
      {/* SVG filter inline (só 1x por página) */}
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <filter id="neon-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <h1
        style={{
          color,
          filter: "url(#neon-glow)",
          textShadow: neon
            ? "0 0 8px oklch(0.78 0.22 50), 0 0 16px oklch(0.78 0.22 50)"
            : "none",
          transition: "color 80ms, text-shadow 200ms",
        }}
        className="font-display text-center text-5xl sm:text-7xl"
      >
        HALLOWEEN PARTY
      </h1>
    </>
  );
}
```

## EnvelopeSequence (orquestrador)

```tsx
type Phase = "closed" | "opening" | "letter-rising" | "letter-expand" | "open";

export function EnvelopeSequence({ name, onClose }: {
  name?: string;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("closed");

  function start() {
    if (phase !== "closed") return;
    setPhase("opening");
    setTimeout(() => setPhase("letter-rising"), 200);
    setTimeout(() => setPhase("letter-expand"), 1000);
    setTimeout(() => setPhase("open"), 1400);
  }

  return (
    <div className="relative h-full w-full">
      <AnimatePresence>
        {phase === "closed" && (
          <motion.button
            key="envelope"
            onClick={start}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: 200, transition: { duration: 0.5 } }}
            className="absolute inset-0 m-auto block h-auto w-full max-w-3xl"
          >
            <img src="/envelope-fechado.png" alt="..." className="bg-transparent w-full" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(phase === "letter-rising" || phase === "letter-expand" || phase === "open") && (
          <CartaConvite
            key="carta"
            src="/carta.png"
            name={name}
            onClose={onClose}
            visible={phase === "letter-expand" || phase === "open"}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
```

## Admin — Optimistic Update (InviteRow)

```tsx
function InviteRow({ invite, onChanged }: Props) {
  const [local, setLocal] = useState(invite);
  const [busy, setBusy] = useState(false);

  async function toggle(field: "sent" | "confirmed") {
    if (busy) return;
    const next = { ...local, [field]: !local[field] };
    setLocal(next);    // instantâneo
    setBusy(true);
    try {
      await updateInvite({ data: { id: next.id, [field]: next[field] } });
      onChanged();    // refetch em background
    } catch {
      setLocal(local); // reverter
    } finally {
      setBusy(false);
    }
  }

  return (
    <tr className={busy ? "opacity-60" : ""}>
      <td>{local.name}</td>
      <td>
        <input
          type="checkbox"
          checked={local.sent}
          onChange={() => toggle("sent")}
          disabled={busy}
          className="h-5 w-5 accent-pumpkin"   {/* mobile-friendly */}
        />
      </td>
      ...
    </tr>
  );
}
```

## Admin — Mobile Layout

Substituir `<table>` por lista de `<li>` (cards em mobile, table em sm+).

```tsx
<div className="overflow-hidden rounded-sm border border-crimson-deep bg-crimson-deep/30">
  <ul className="divide-y divide-parchment/10">
    {filtered.map(inv => (
      <li key={inv.id} className="block sm:table-row">
        <div className="flex flex-col gap-3 p-4 sm:table-cell sm:align-top sm:p-3">
          <div>
            <p className="text-base text-parchment">{inv.name}</p>
            <p className="font-mono text-xs text-parchment/40">/?id={inv.id}</p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <label className="flex min-h-[44px] items-center gap-2">
              <input type="checkbox" className="h-5 w-5 accent-pumpkin" />
              <span className="text-sm">Enviado</span>
            </label>
            <label className="flex min-h-[44px] items-center gap-2">
              <input type="checkbox" className="h-5 w-5 accent-pumpkin" />
              <span className="text-sm">Confirmou</span>
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <a className="inline-flex min-h-[44px] items-center rounded border px-4 py-2 text-sm">💬 WhatsApp</a>
            <a className="inline-flex min-h-[44px] items-center rounded border px-4 py-2 text-sm">✉️ Email</a>
            <button className="inline-flex min-h-[44px] items-center rounded border px-4 py-2 text-sm">🔗</button>
            <button className="inline-flex min-h-[44px] items-center rounded border px-4 py-2 text-sm">🗑️</button>
          </div>
        </div>
      </li>
    ))}
  </ul>
</div>
```

Header responsivo:
```tsx
<header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <h1>Convites de Halloween</h1>
    <p>Logado como <strong>{user}</strong></p>
  </div>
  <button className="self-start min-h-[44px] px-4 py-2 sm:self-auto">Sair</button>
</header>
```

## Pixel-perfect do efeito neon (sintonia)

| Frame | Duração | Cor | Efeito |
|---|---|---|---|
| t=0ms | inicial | `oklch(0.35 0.13 22)` (vinho apagado) | estática |
| t=200ms | 70ms | `oklch(0.78 0.22 50)` (laranja neon) | flicker 1 |
| t=270ms | 70ms | volta pro vinho | |
| t=450ms | 70ms | laranja | flicker 2 |
| t=520ms | 70ms | vinho | |
| t=700ms | 70ms | laranja | flicker 3 |
| t=770ms | 70ms | vinho | |
| t=950ms | 70ms | laranja | flicker 4 |
| t=1020ms | 70ms | vinho | |
| t=1200ms | 70ms | laranja | flicker 5 |
| t=1270ms | 70ms | **estabiliza** laranja neon (com glow) | final |

5 piscadas em ~1.2s. Visual: parece "neon com mau contato" melhorando.

Se ficar muito rápido/lento, ajusto. Mas o ponto de partida é esse.
