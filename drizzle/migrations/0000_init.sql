-- =========================================================
-- EVERLONG — migration inicial
-- =========================================================

create extension if not exists "pgcrypto";

create table "config_casal" (
  "id" boolean primary key default true,
  "data_inicio" timestamptz not null,
  "drive_folder_id" text not null,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),
  constraint "chk_config_singleton" check ("id" = true)
);

create table "perfis" (
  "id" uuid primary key default gen_random_uuid(),
  "nome" text not null unique,
  "senha_hash" text not null,
  "avatar_url" text,
  "created_at" timestamptz not null default now()
);

create table "fases" (
  "id" uuid primary key default gen_random_uuid(),
  "nome" text not null,
  "descricao" text,
  "data_inicio" date not null,
  "data_fim" date,
  "ordem" integer not null,
  "created_at" timestamptz not null default now(),
  constraint "chk_fase_datas" check ("data_fim" is null or "data_fim" >= "data_inicio")
);
create unique index "uq_fases_ordem" on "fases" ("ordem");

create table "fotos" (
  "id" uuid primary key default gen_random_uuid(),
  "fase_id" uuid references "fases"("id") on delete set null,
  "autor_id" uuid references "perfis"("id") on delete set null,
  "drive_file_id" text not null unique,
  "mime_type" text not null,
  "tamanho_bytes" bigint not null,
  "largura" integer,
  "altura" integer,
  "legenda" text,
  "tirada_em" timestamptz,
  "uploaded_at" timestamptz not null default now()
);
create index "idx_fotos_tirada_em" on "fotos" ("tirada_em" desc nulls last);
create index "idx_fotos_fase" on "fotos" ("fase_id");

create table "eventos" (
  "id" uuid primary key default gen_random_uuid(),
  "fase_id" uuid references "fases"("id") on delete set null,
  "foto_id" uuid references "fotos"("id") on delete set null,
  "titulo" text not null,
  "descricao" text,
  "data_evento" timestamptz not null,
  "icone" text,
  "created_at" timestamptz not null default now()
);
create index "idx_eventos_data" on "eventos" ("data_evento" desc);
create index "idx_eventos_fase" on "eventos" ("fase_id");

create table "capsulas" (
  "id" uuid primary key default gen_random_uuid(),
  "autor_id" uuid not null references "perfis"("id") on delete restrict,
  "destinatario_id" uuid references "perfis"("id") on delete set null,
  "titulo" text not null,
  "conteudo" text not null,
  "data_criacao" timestamptz not null default now(),
  "data_desbloqueio" timestamptz not null,
  "aberta_em" timestamptz,
  constraint "chk_desbloq_futuro" check ("data_desbloqueio" > "data_criacao")
);
create index "idx_capsulas_desbloq" on "capsulas" ("data_desbloqueio");

create table "recados" (
  "id" uuid primary key default gen_random_uuid(),
  "autor_id" uuid not null references "perfis"("id") on delete cascade,
  "conteudo" text not null,
  "cor" text not null default 'amarelo',
  "posicao_x" integer not null default 0,
  "posicao_y" integer not null default 0,
  "rotacao" integer not null default 0,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now()
);
create index "idx_recados_created" on "recados" ("created_at" desc);

-- =========================================================
-- Trigger genérico updated_at
-- =========================================================
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_recados_updated
  before update on "recados"
  for each row execute function set_updated_at();

create trigger trg_config_updated
  before update on "config_casal"
  for each row execute function set_updated_at();

-- =========================================================
-- Supabase Realtime: habilita stream em recados
-- =========================================================
alter publication supabase_realtime add table "recados";

-- =========================================================
-- RLS: API usa service_role (bypass). Defesa em profundidade.
-- =========================================================
alter table "config_casal" enable row level security;
alter table "perfis"       enable row level security;
alter table "fases"        enable row level security;
alter table "fotos"        enable row level security;
alter table "eventos"      enable row level security;
alter table "capsulas"     enable row level security;
alter table "recados"      enable row level security;
