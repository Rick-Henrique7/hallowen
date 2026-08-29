# Proposal: Guest Card Redesign (002)

## Contexto

A landing atual (`src/routes/index.tsx`) usa dois SVGs do Illustrator
(`envelope-fechado.svg` 2.2MB e `envelope-aberto.svg` 780KB) que são na
verdade PNGs embedados em base64. O fluxo é só "clica → abre" e a
"carta" que aparece é o próprio envelope-aberto.svg com o nome do
convidado por cima. Sem texto de verdade (sem "Halloween Party", sem
data, sem local). Sem animação de saída. Sem mobile-friendly.

Além disso, o painel admin tem 2 bugs críticos:
- Toggle "Enviado" / "Confirmou" trava ou com delay
- Layout não é responsivo pra mobile (organizadora usa o celular)

## Decisões confirmadas (2026-08-29)

| Item | Decisão |
|---|---|
| Carta | **PNG** (enviada pela designer) |
| Efeito neon "Halloween Party" | **SVG filter + JS** controlando piscadas |
| Envelope | Some na abertura, **volta** ao fechar/recarregar (animação reversível) |
| Aranhas andando dentro | **Removidas** (você marcou como "ruins") |
| Imagens novas (envelope + carta) | Pendentes — você vai trazer |
| Tipografia do título | "Pirata One" (já no projeto via Google Fonts) |

## O que vai mudar

### Página `/` (guest landing)

Substituir o fluxo atual por uma **anima��ão encadeada em 5 passos**:

1. **Estado inicial**: envelope fechado (PNG que a designer vai mandar),
   centralizado, com hover/focus ring
2. **Click → passo 1** (~0.2s): flip da aba do envelope abre (rotação 3D
   na aba de cima)
3. **Click → passo 2** (~0.8s): um papel (carta) **sobe de dentro** do
   envelope com a mesma largura. Simultaneamente o envelope **desce**
   em direção ao rodapé e **desaparece** (slide-out + opacity 0)
4. **Click → passo 3** (~0.6s): a carta que saiu agora **se expande**
   pra ocupar ~75% da largura da tela (scale ou width transition)
5. **Click → passo 4** (~0.4s): o título "HALLOWEEN PARTY" entra com
   **efeito neon**: começa em **vermelho vinho apagado**, **pisca**
   várias vezes em **laranja neon** (efeito "placa de neon com mau
   contato"), e estabiliza no laranja neon final

A carta (PNG) vai estar **posicionada por cima** do envelope durante
o passo 2-3 (a carta sobe e o envelope desce, em paralelo). Depois da
expansão, a carta vira o elemento principal da tela.

**Botão "Fechar"** no canto superior direito da carta aberta. Ao
clicar: animação reversa (carta encolhe → desce → envelope sobe
de volta → aba fecha). Também reseta no reload.

**Conteúdo da carta (visível após estabilizar)**:
- "HALLOWEEN PARTY" em Pirata One, gigante, com efeito neon
- "Para [nome]" se vier via URL (?name=Maria)
- Espaço pra QR code (placeholder por enquanto, você vai gerar depois)
- Fundo transparente (você pediu "background none na div" pra não
  aparecer quadrado ao redor)

### Página `/admin` (painel CRUD)

Resolver os 2 bugs críticos que você reportou.

**Bug 1: Toggle travando**

Investigação: o `InviteRow.tsx` chama `updateInvite({ data: { id, sent: !invite.sent } })`
e depois `onChanged()` que faz `router.invalidate()`. O invalidate
re-roda o loader, que chama `listInvites()` (server function = HTTP
roundtrip ao DB). Em conexões ruins ou DB lento, isso causa o delay
percebido.

Fix proposto: **optimistic update local** no estado do componente
antes de chamar a server function. Se a chamada falhar, reverter.

**Bug 2: Sem responsividade mobile**

Estado atual: tabela com `<th>` em 4 colunas (Convidado | Enviado |
Confirmou | Ações), checkbox de 16px, botões pequenos. No mobile
(você mostrou o print), os elementos ficam **sobrepostos** e os
botões de ação ilegíveis.

Fix proposto: **layout mobile-first**
- Tabela vira **cards verticais** em telas < 768px
- Botões de ação viram ícones grandes (mín 44×44px, touch target
  recomendado Apple/Google)
- Inputs/checkboxes com min-height 44px
- Status filter vira dropdown de largura total no mobile
- Header do painel: "Convites" + "Sair" em 2 linhas se apertar

### Bugs de UI a corrigir

- ❌ **Quadrado de fundo ao redor do envelope** (você reportou 3x).
  Causa: o PNG embedado tem o retângulo do próprio Illustrator.
  Quando `mix-blend-mode: multiply` aplica, o background do PNG
  (laranja no original, agora deveria ser crimson) deveria sumir.
  **Não tá sumindo consistentemente** — vou debugar de verdade dessa
  vez. Provavelmente é o `aspect-[3/2]` do wrapper que tá cortando o
  blend, ou o `mix-blend-mode` não funciona com `<img>` em alguns
  browsers quando o container tem `position: absolute`.

  Plano: trocar `<img>` por um wrapper com `background: crimson` e a
  imagem dentro com `mix-blend-mode: multiply`. Ou simplesmente
  **re-exportar o SVG do Illustrator sem o background** (você vai
  mandar o novo mesmo).

## O que sai

- ❌ 2 instâncias de `<WalkingSpider />` dentro do envelope aberto
  (você marcou como "ruins")
- ❌ Componente `SpiderOverlay.tsx` continua existindo (danglers no
  background da página) — mas sem aranhas dentro da carta
- ❌ `mix-blend-mode: darken` (substituído por `multiply`, que é
  mais previsível)
- ❌ `aspect-[3/2]` no wrapper do envelope (substituído por aspect
  ratio do PNG novo)

## O que NÃO vai mudar

- ✅ Schema do DB (admin, invites, sessions)
- ✅ Server functions (auth + invites)
- ✅ Rotas /admin, /admin/login, /admin/setup
- ✅ Auth (bcrypt + httpOnly cookies)
- ✅ Embers + SpiderOverlay no background da landing (mantidos)
- ✅ Lottie das aranhas do background (mantidas, só as 2 internas saem)

## Pendências externas (você traz)

1. **PNG do novo envelope fechado** (substitui `envelope-fechado.svg`)
2. **PNG do envelope aberto** ou **PNG da carta sozinha** (você decide
   se quer 1 carta-com-fundo-transparente ou um envelope-aberto
   que serve de moldura)
3. **Opcional**: uma versão da carta em **2 PNGs separados** (carta
   dentro do envelope + carta fora) pra eu poder animar a saída
   de dentro do envelope com mais fidelidade

## Pendências internas (eu trago)

- Spec do efeito neon SVG filter (quais `<feGaussianBlur>`, `<feMerge>`)
- Layout CSS do admin mobile-first
- Lógica de optimistic update no InviteRow

## Riscos

- O efeito neon de "piscar com mau contato" é tricky de acertar em
  keyframe. Pode ficar artificial se eu exagerar. Vou fazer 4-5
  piscadas curtas (50-150ms cada) e estabilizar.
- Optimistic update no admin: se o servidor falhar, preciso reverter
  o estado local. Risco de dessincronia se o usuário fizer 2 ações
  rápidas em sequência. Mitigação: desabilitar o checkbox enquanto
  a chamada tá em flight.
- Mobile: o print que você mandou mostra os botões "Enviado" e
  "Confirmou" **sobrepondo o nome do convidado**. Isso é CSS de
  tabela quebrada em viewport estreito. Vou refazer com grid/flex
  que respeita min-width.

## Critérios de aceite

- [ ] Click no envelope fechado inicia a sequência 5-passos
- [ ] Envelope "some" ao final da sequência (não fica visível)
- [ ] Carta (PNG) tem fundo **transparente** (sem quadrado ao redor)
- [ ] Título "HALLOWEEN PARTY" tem efeito neon com piscadas
- [ ] Recarregar a página volta pro estado inicial (envelope fechado)
- [ ] Em mobile (< 768px), painel admin é usável com 1 mão: botões
      ≥44px, sem sobreposição de texto
- [ ] Toggle "Enviado" / "Confirmou" responde em < 200ms visualmente
      (optimistic), com reversão se o server falhar
- [ ] Sem regressão na rota `/admin/setup` (criar admin) e
      `/admin/login`
