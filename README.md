# Everlong

Álbum de fotos e memórias de um casal. Web app feito sob medida para guardar lembranças, marcar momentos da relação e trocar recadinhos em tempo real.

> **Status atual:** back-end e camada de dados concluídos. Front-end será desenvolvido na próxima fase.

---

## Funcionalidades

- **Álbum de fotos** — upload com legenda, organização por fases da relação. Binários no Google Drive (privado), metadados no Postgres.
- **Cronômetro de namoro** — tempo decorrido desde a primeira data, fragmentado em anos/meses/dias/horas/minutos/segundos.
- **Linha do tempo** — eventos marcantes associados a fases, com foto-capa opcional.
- **Cápsulas do tempo** — mensagens bloqueadas até uma data futura. Conteúdo nunca trafega antes do desbloqueio (`423 Locked`).
- **Mural de recados** — post-its colaborativos com sincronização em tempo real entre os dois perfis (Supabase Realtime).
- **Autenticação por perfil** — dois perfis pré-criados (casal); login = escolher perfil + senha.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router, Route Handlers em Node runtime) |
| Linguagem | TypeScript |
| Banco de dados | PostgreSQL via Supabase |
| ORM | DrizzleORM + driver `postgres` |
| Realtime | Supabase Realtime (canal `postgres_changes`) |
| Armazenamento de mídia | Google Drive via Service Account (`googleapis`) |
| Autenticação | argon2id + JWT HS256 (`jose`) em cookie HttpOnly |
| Validação | zod |
| Docs | OpenAPI 3.1 + Swagger UI |

### Decisões arquiteturais

- **Single-tenant**: o sistema atende um único casal — schema sem `casal_id` propagado.
- **Drive oculto**: o client nunca fala direto com o Google Drive. Todo upload e leitura passa pelo back-end.
- **Defesa em profundidade**: RLS habilitado em todas as tabelas; a API usa `service_role`.
- **Realtime apenas em recados**: única tabela que precisa de sincronização ao vivo.

---

## Estrutura do projeto

```
src/
├── app/
│   ├── api/                # Route Handlers REST
│   │   ├── auth/           # login, logout, me
│   │   ├── perfis/
│   │   ├── fotos/          # CRUD + binario (stream proxy)
│   │   ├── cronometro/
│   │   ├── fases/
│   │   ├── eventos/
│   │   ├── capsulas/       # gate temporal (423)
│   │   ├── recados/        # Realtime
│   │   ├── health/
│   │   ├── openapi/        # spec JSON
│   │   └── docs/           # Swagger UI
│   ├── layout.tsx
│   └── page.tsx
├── server/
│   ├── db/                 # Drizzle client + schema
│   ├── services/           # lógica de domínio (drive, auth, fotos, capsulas, cronometro)
│   └── lib/                # http helpers, session, openapi
├── types/                  # DTOs e tipos de domínio
└── env.ts                  # validação de env via zod
drizzle/
└── migrations/             # SQL inicial (tabelas + triggers + Realtime + RLS)
scripts/
├── seed-perfis.ts          # cria os 2 perfis + config_casal
└── init-drive-folder.ts    # cria pasta raiz no Drive (1x)
```

---

## Setup

### 1. Pré-requisitos

- Node.js 20+ e pnpm
- Conta no [Supabase](https://supabase.com)
- Conta no [Google Cloud](https://console.cloud.google.com) com Drive API habilitada

### 2. Variáveis de ambiente

```bash
pnpm install
cp .env.example .env.local
# preencha DATABASE_URL, SESSION_SECRET, GOOGLE_*
```

`.env.local` mínimo:

```
DATABASE_URL=postgres://postgres.xxxxx:<SENHA_URL_ENCODED>@aws-0-xxx.pooler.supabase.com:5432/postgres
GOOGLE_SERVICE_ACCOUNT_B64=<base64 do JSON da SA>
GOOGLE_DRIVE_FOLDER_ID=<id da pasta>
SESSION_SECRET=<32 bytes hex — openssl rand -hex 32>
```

> Se a senha do Postgres tiver `@`, `:`, `/`, `#` etc, faça URL-encode com `[System.Web.HttpUtility]::UrlEncode(...)` no PowerShell.

### 3. Banco

**Recomendado** — cole `drizzle/migrations/0000_init.sql` no SQL Editor do Supabase. Inclui tabelas + triggers + publication do Realtime + RLS.

Alternativa via Drizzle (não aplica os blocos custom):

```bash
pnpm db:push
```

### 4. Google Drive

1. Crie um projeto no GCP, habilite a Drive API.
2. Crie uma Service Account → Keys → Add Key → JSON. Baixe o arquivo.
3. Converta em base64 e cole em `GOOGLE_SERVICE_ACCOUNT_B64`:
   ```powershell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("service-account.json"))
   ```
4. Crie a pasta raiz:
   ```bash
   pnpm drive:init "Everlong"
   ```
   Cole o ID retornado em `GOOGLE_DRIVE_FOLDER_ID`.
5. **Compartilhe a pasta com o `client_email` da Service Account** (Editor). Sem isso os uploads ficam invisíveis no seu Drive.

### 5. Seed dos 2 perfis + linha de configuração

```bash
pnpm seed -- "Pessoa A" "senhaA" "Pessoa B" "senhaB" "2020-01-01T00:00:00Z" "<drive_folder_id>"
```

### 6. Dev

```bash
pnpm dev
```

- App: http://localhost:3000
- Swagger UI: http://localhost:3000/api/docs
- OpenAPI spec: http://localhost:3000/api/openapi
- Health: http://localhost:3000/api/health

---

## Endpoints

| Método | Path | Descrição |
|---|---|---|
| GET  | `/api/health` | Status + ping DB |
| GET  | `/api/docs` | Swagger UI interativa |
| GET  | `/api/openapi` | OpenAPI 3.1 JSON |
| POST | `/api/auth/login` | `{perfil_id, senha}` → cookie `evl_session` |
| POST | `/api/auth/logout` | Limpa cookie |
| GET  | `/api/auth/me` | Perfil corrente |
| GET  | `/api/perfis` | Lista perfis (sem hash) |
| GET/POST | `/api/fotos` | Lista paginada (cursor) / upload multipart |
| GET/PATCH/DELETE | `/api/fotos/:id` | Metadados |
| GET  | `/api/fotos/:id/binario` | Stream proxy do Drive |
| GET  | `/api/cronometro` | Tempo decorrido fragmentado |
| GET/POST | `/api/fases` | CRUD fases |
| PATCH/DELETE | `/api/fases/:id` | |
| GET/POST | `/api/eventos` | Linha do tempo |
| PATCH/DELETE | `/api/eventos/:id` | |
| GET/POST | `/api/capsulas` | Metadata-only na listagem |
| GET/DELETE | `/api/capsulas/:id` | **423 Locked** antes de `data_desbloqueio` |
| GET/POST | `/api/recados` | Realtime via `supabase_realtime` |
| PATCH/DELETE | `/api/recados/:id` | |

Documentação interativa completa em `/api/docs`.

---

## Realtime (recados)

A migration já habilita `recados` no `supabase_realtime`. Consumo futuro no front:

```ts
supabase.channel('recados')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'recados' }, (p) => console.log(p))
  .subscribe();
```

Para consumir Realtime direto do client, adicione uma policy `SELECT` em `recados` para `anon`/`authenticated`.

---

## Scripts

```bash
pnpm dev         # dev server
pnpm build       # build de produção
pnpm start       # serve build
pnpm typecheck   # tsc --noEmit
pnpm lint
pnpm test        # vitest

pnpm db:generate # gera migration nova a partir do schema
pnpm db:push     # aplica schema direto (dev)
pnpm db:migrate  # aplica migrations versionadas
pnpm db:studio   # Drizzle Studio

pnpm seed        # roda seed-perfis.ts
pnpm drive:init  # cria pasta raiz no Drive
```

---

## Segurança

- **RLS** habilitado em todas as tabelas; back-end usa `service_role` (bypass intencional). Defesa em profundidade.
- **Cookie** de sessão: HttpOnly + SameSite=Lax + Secure em produção.
- **Argon2id** (memoryCost 19 MiB, t=2, p=1).
- **Rate limit** in-memory por perfil no login (5 tentativas / 1 min). Para múltiplas instâncias, migrar para Redis/Upstash.
- **Cápsulas** nunca retornam `conteudo` antes da `data_desbloqueio` — listagem usa `select` explícito e o gate `423 Locked` é aplicado no service, não confiando apenas no cliente.
- **Drive** acessível só pela Service Account; o client nunca recebe credenciais ou file IDs externos.

---

## Roadmap

- [x] Back-end: schema, migrations, endpoints REST
- [x] Integração com Google Drive
- [x] Auth de perfis
- [x] OpenAPI + Swagger UI
- [x] Health check
- [ ] Front-end (Next.js, mesma codebase)
- [ ] Testes automatizados (cronometro, capsulas, auth)
- [ ] Deploy (Vercel + Supabase produção)

---

## Licença

Ver `LICENSE`.
