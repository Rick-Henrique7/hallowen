# Spec: Sistema de Convites Digitais de Halloween

## 1. Requisitos Funcionais

### 1.1 Página do convidado (`/`)

- **RF-1.1**: Carrega com envelope fechado (estado inicial, `open=false`)
- **RF-1.2**: Lê query params `id` e `name` da URL
- **RF-1.3**: Se `name` presente, exibe "Maria" no envelope aberto (personalização)
- **RF-1.4**: Click no envelope fecha→abre com animação
- **RF-1.5**: Página é 100% pública — não exige login, não consulta DB
- **RF-1.6**: 2 aranhas andando (Lottie) atravessam o envelope aberto

### 1.2 Admin — Setup (`/admin/setup`)

- **RF-2.1**: Aparece SÓ quando `admin` table está vazia
- **RF-2.2**: Form com `username` + `password` (mínimo 8 chars)
- **RF-2.3**: Cria o admin, redireciona pra `/admin/login`
- **RF-2.4**: Após admin criado, `/admin/setup` nunca mais aparece

### 1.3 Admin — Login (`/admin/login`)

- **RF-3.1**: Form com `username` + `password`
- **RF-3.2**: Submeter chama `login` server function
- **RF-3.3**: Se OK, seta cookie de sessão, redireciona pra `/admin`
- **RF-3.4**: Se inválido, mostra erro inline (sem distinção "user não existe" vs "senha errada")

### 1.4 Admin — Painel (`/admin`)

- **RF-4.1**: Requer sessão válida (cookie presente + não expirado)
- **RF-4.2**: Sem sessão → redireciona pra `/admin/login`
- **RF-4.3**: Lista todos os invites do DB, mais recentes primeiro
- **RF-4.4**: Campo de busca filtra por nome (client-side, sem refetch)
- **RF-4.5**: Filtro por status: Todos / Pendentes / Enviados / Confirmados
- **RF-4.6**: Botão "+ Novo" abre form inline (nome + botão "Gerar")
- **RF-4.7**: Cada linha mostra: nome, link, toggle enviado, toggle confirmou, ações
- **RF-4.8**: Botão "Email" abre `mailto:` com mensagem pré-formatada
- **RF-4.9**: Botão "WhatsApp" abre `https://wa.me/?text=...`
- **RF-4.10**: Botão "Copiar" copia o link pro clipboard
- **RF-4.11**: Botão "Excluir" pede confirmação, depois deleta
- **RF-4.12**: Botão "Sair" no header chama `logout`, redireciona pro login

### 1.5 Server functions (API)

- **RF-5.1**: `getCurrentAdmin()` — retorna `{ id, username }` ou `null`
- **RF-5.2**: `setupAdmin({ username, password })` — cria admin (só se vazio)
- **RF-5.3**: `login({ username, password })` — valida, cria session, seta cookie
- **RF-5.4**: `logout()` — deleta session, clear cookie
- **RF-5.5**: `listInvites()` — retorna todos os invites
- **RF-5.6**: `createInvite({ name })` — gera id (6-char), insere, retorna
- **RF-5.7**: `updateInvite({ id, sent?, confirmed? })` — atualiza campos
- **RF-5.8**: `deleteInvite({ id })` — remove row

## 2. Requisitos Não-Funcionais

### 2.1 Performance
- **RNF-1**: First Contentful Paint < 1.5s em 3G simulado
- **RNF-2**: Server function responde em < 500ms (DB pequeno, queries simples)
- **RNF-3**: Lottie anima suave (60fps) sem jank

### 2.2 Segurança
- **RNF-4**: Senha do admin armazenada com bcrypt (cost ≥ 10)
- **RNF-5**: Cookie de sessão httpOnly, secure (em prod), sameSite=lax
- **RNF-6**: Token de sessão = 32 chars random (256 bits de entropia)
- **RNF-7**: Sessão expira em 30 dias (renovação só no próximo login)
- **RNF-8**: Server functions validam ownership antes de mutar dados (não
  relevante agora pq single-tenant, mas é boa prática pra futuro)
- **RNF-9**: Prepared statements sempre (Drizzle já garante)
- **RNF-10**: Senha mínima 8 chars no setup (sem exigência de uppercase/symbol)

### 2.3 Compatibilidade
- **RNF-11**: Funciona em Chrome/Firefox/Safari últimas 2 versões
- **RNF-12**: Funciona em mobile (iOS Safari, Android Chrome)
- **RNF-13**: Funciona com JS desabilitado (degrada pra página estática? — não
  requisito, ignore)

### 2.4 Operacional
- **RNF-14**: Deploy via Vercel + GitHub (push = deploy)
- **RNF-15**: Migrations rodam no build/start do Nitro
- **RNF-16**: Logs no Vercel (não precisa separado)

## 3. Critérios de Aceite

### CA-1: Setup do admin
- [ ] Em DB vazio, acessar `/admin` redireciona pra `/admin/setup`
- [ ] Form valida username único + senha ≥ 8 chars
- [ ] Submit cria admin, redireciona pro login
- [ ] Tentar acessar `/admin/setup` com admin existente → redireciona pro login

### CA-2: Login
- [ ] Credenciais válidas → cookie setado, redireciona pra `/admin`
- [ ] Credenciais inválidas → erro inline visível, sem distinção user/senha
- [ ] Refresh da página em `/admin` logado → continua logado (cookie válido)

### CA-3: CRUD de invites
- [ ] Criar invite com nome "Maria" → row aparece na lista com id gerado
- [ ] Toggle "Enviado" → atualiza DB, persiste após refresh
- [ ] Toggle "Confirmou" → atualiza DB, persiste após refresh
- [ ] Delete → confirma, remove da lista, remove do DB
- [ ] Busca por "Mar" filtra mostrando só "Maria" e similares
- [ ] Filtro "Pendentes" esconde os com `sent=true`

### CA-4: Ações de envio
- [ ] Botão WhatsApp abre `https://wa.me/?text=...` com nome + link
- [ ] Botão Email abre `mailto:` com subject + body
- [ ] Botão Copiar copia `https://<host>/?id=X&name=Maria` pro clipboard

### CA-5: Página do convidado
- [ ] `/` mostra envelope sem nome
- [ ] `/?id=ABC&name=Maria` mostra envelope + "Maria" no aberto
- [ ] Click no envelope → abre com animação, aranhas andam
- [ ] Funciona em mobile (touch no envelope)

### CA-6: Logout
- [ ] Botão Sair → deleta session, redireciona pro login
- [ ] Após logout, refresh em `/admin` → redireciona pro login (cookie limpo)

## 4. Mensagens pré-formatadas (copia exata)

**WhatsApp (`https://wa.me/?text=...`):**
```
Olá {{nome}}! 🎃

Aqui está seu convite para a festa de Halloween:
{{link}}

31 de outubro, fantasia obrigatória. Te espero!
```

**Email (`mailto:?subject=...&body=...`):**
- Subject: `Convite — Festa de Halloween`
- Body: mesmo texto do WhatsApp

URL-encode tudo. A `{{link}}` é `${origin}/?id=${invite.id}&name=${encodeURIComponent(invite.name)}`.

## 5. Out of Scope (re-confirmado)

- OAuth, magic link, password reset
- Multi-tenant
- Sincronização entre devices
- Analytics
- Envio real de WhatsApp/email
- Testes automatizados
- i18n
- Schema versionado/migrations reversíveis
- Rate limiting
- Logout de "todos os devices"
- Soft delete / audit log
- Internacionalização de datas / números
