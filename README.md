# Everlong

Álbum de fotos e memórias de um casal. Web app sob medida para guardar lembranças, marcar os momentos da relação e trocar recadinhos — tudo num dark mode azul-petróleo com a esfera metálica como assinatura visual.

---

## Funcionalidades

- **Landing** — apresentação do app com a identidade visual e CTA de entrada.
- **Login por perfil** — dois perfis pré-criados (o casal); login = escolher perfil + senha.
- **Dashboard** — cronômetro de namoro ao vivo (anos→segundos), fotos recentes, últimos recados e próxima cápsula.
- **Álbum** — grid masonry, upload com legenda/data, lightbox com editar/excluir. Binários no Google Drive, metadados no Postgres.
- **Linha do tempo** — marcos da relação alternando lados, criar/editar/excluir evento.
- **Cápsula do tempo** — mensagens bloqueadas até uma data futura. O conteúdo nunca trafega antes do desbloqueio (`423 Locked`).
- **Mural de recados** — post-its coloridos com atualização ao vivo via polling (~10s) entre os dois perfis.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router, RSC + Route Handlers em Node runtime) |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS v4 (tokens em `@theme`) + ícones lucide-react |
| Banco | PostgreSQL (Supabase) |
| ORM | DrizzleORM + driver `postgres` |
| Mídia | Google Drive via OAuth pessoal (`googleapis`) — arquivos na sua conta |
| Auth | argon2id + JWT HS256 (`jose`) em cookie HttpOnly |
| Validação | zod |
| Docs API | OpenAPI 3.1 + Swagger UI (`/api/docs`) |

### Decisões arquiteturais

- **Single-tenant** — atende um único casal; schema sem `casal_id`.
- **RSC-first** — páginas server leem dados via service/db direto; client components só onde há interatividade (cronômetro, upload, mural, leitura de cápsula, login).
- **Drive oculto** — o client nunca fala direto com o Google Drive; todo upload e leitura passa pelo back-end.
- **Mural por polling** — sem websocket no back-end; o mural busca novidades a cada ~10s + update otimista.

---

## Estrutura

```
src/
├── app/
│   ├── (app)/              # área autenticada (guard de sessão)
│   │   ├── home|album|timeline|capsule|board/
│   │   └── layout.tsx
│   ├── login/
│   ├── page.tsx            # landing
│   ├── layout.tsx
│   ├── icon.svg            # favicon (esfera + coração)
│   ├── globals.css         # design system (Tailwind v4)
│   └── api/                # Route Handlers REST
├── components/             # brand, nav, dashboard, album, timeline, capsule, board, identity, ui
├── lib/                    # api (fetch client), colors, format
└── server/
    ├── db/                 # Drizzle client + schema
    ├── services/           # auth, drive, fotos, capsulas, cronometro
    ├── queries.ts          # leituras p/ RSC
    └── lib/                # http, session, openapi
scripts/
├── seed-perfis.ts          # cria os 2 perfis + config_casal
├── gen-drive-token.ts      # gera o refresh token OAuth (1x)
└── init-drive-folder.ts    # cria a pasta raiz no seu Drive
```

---

## Setup

### 1. Pré-requisitos
- Node.js 20+ e pnpm
- Conta no [Supabase](https://supabase.com) (Postgres)
- Conta Google + projeto no [Google Cloud](https://console.cloud.google.com) com Drive API habilitada

### 2. Variáveis de ambiente

```bash
pnpm install
cp .env.example .env.local
```

`.env.local`:

```
DATABASE_URL=postgres://postgres.xxxxx:<SENHA_URL_ENCODED>@aws-0-xxx.pooler.supabase.com:5432/postgres
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GOOGLE_OAUTH_REFRESH_TOKEN=
GOOGLE_DRIVE_FOLDER_ID=
SESSION_SECRET=          # openssl rand -hex 32
```

### 3. Banco

Cole `drizzle/migrations/0000_init.sql` no SQL Editor do Supabase (tabelas + triggers + RLS). Alternativa em dev: `pnpm db:push`.

### 4. Google Drive (OAuth pessoal)

Os arquivos ficam na **sua** conta Google (15 GB grátis), não numa Service Account.

1. Google Cloud Console → habilite a **Drive API**.
2. **OAuth consent screen** → tipo External → adicione seu e-mail em test users → **Publish app** (Production), senão o refresh token expira em 7 dias.
3. **Credentials → OAuth client ID → Desktop app** → copie Client ID e Secret para o `.env.local`.
4. Gere o refresh token:
   ```bash
   pnpm drive:token
   ```
   Abra a URL, autorize, cole o `GOOGLE_OAUTH_REFRESH_TOKEN` no `.env.local`.
5. Crie a pasta raiz e copie o id para `GOOGLE_DRIVE_FOLDER_ID`:
   ```bash
   pnpm drive:init "Everlong"
   ```

### 5. Seed dos perfis

```bash
pnpm seed -- "Pessoa A" "senhaA" "Pessoa B" "senhaB" "2020-01-01T00:00:00Z" "<drive_folder_id>"
```

### 6. Dev

```bash
pnpm dev
```

- App: http://localhost:3000
- Swagger UI: http://localhost:3000/api/docs
- Health: http://localhost:3000/api/health

---

## Deploy (Render — grátis)

O app roda como servidor Node (não serverless), então não esbarra no limite de body de 4.5 MB nem em problemas com módulos nativos.

1. Push do repo para o GitHub.
2. Render → **New → Blueprint** (lê o `render.yaml`) ou **New → Web Service** manual:
   - Build: `pnpm install --frozen-lockfile && pnpm build`
   - Start: `pnpm start` (o Next lê `$PORT`)
3. Em **Environment**, defina as 6 variáveis do `.env.local`.
4. Deploy. Health check em `/api/health`.

> Plano free dorme após ~15 min de inatividade (cold start ~40s na 1ª visita).
>
> **Vercel não é recomendada**: funções serverless têm limite de **4.5 MB** no body → uploads de foto maiores quebram. No Render não há esse limite.

---

## Scripts

```bash
pnpm dev          # dev server
pnpm build        # build de produção
pnpm start        # serve o build
pnpm typecheck    # tsc --noEmit
pnpm test         # vitest

pnpm db:push      # aplica schema (dev)
pnpm db:migrate   # migrations versionadas
pnpm db:studio    # Drizzle Studio

pnpm seed         # cria os 2 perfis + config
pnpm drive:token  # gera o refresh token OAuth do Drive
pnpm drive:init   # cria a pasta raiz no Drive
```

---

## Endpoints

| Método | Path | Descrição |
|---|---|---|
| GET  | `/api/health` | Status + ping DB |
| GET  | `/api/docs` / `/api/openapi` | Swagger UI / spec |
| POST | `/api/auth/login` | `{perfil_id, senha}` → cookie `evl_session` |
| POST | `/api/auth/logout` | Limpa cookie |
| GET  | `/api/auth/me` | Perfil corrente |
| GET  | `/api/perfis` | Lista perfis (sem hash) |
| GET/POST | `/api/fotos` | Lista paginada / upload multipart |
| GET/PATCH/DELETE | `/api/fotos/:id` | Metadados |
| GET  | `/api/fotos/:id/binario` | Stream proxy do Drive |
| GET  | `/api/cronometro` | Tempo decorrido fragmentado |
| GET/POST · PATCH/DELETE | `/api/fases` · `/api/fases/:id` | Fases |
| GET/POST · PATCH/DELETE | `/api/eventos` · `/api/eventos/:id` | Linha do tempo |
| GET/POST | `/api/capsulas` | Metadata-only na listagem |
| GET/DELETE | `/api/capsulas/:id` | **423 Locked** antes da `data_desbloqueio` |
| GET/POST · PATCH/DELETE | `/api/recados` · `/api/recados/:id` | Mural |

---

## Segurança

- **RLS** habilitado nas tabelas; back-end usa `service_role` (defesa em profundidade).
- **Cookie** de sessão HttpOnly + SameSite=Lax + Secure em produção.
- **Argon2id** (memoryCost 19 MiB, t=2, p=1) + rate limit in-memory no login (5/min por perfil).
- **Cápsulas** nunca retornam `conteudo` antes da `data_desbloqueio` — gate `423` no service.
- **Drive** acessível só pelo back-end (OAuth do dono); o client nunca recebe credenciais ou file IDs externos.

---

## Licença

Ver [`LICENSE`](./LICENSE).
