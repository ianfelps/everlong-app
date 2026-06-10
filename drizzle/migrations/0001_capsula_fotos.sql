create table "capsula_fotos" (
  "id" uuid primary key default gen_random_uuid(),
  "capsula_id" uuid not null references "capsulas"("id") on delete cascade,
  "drive_file_id" text not null unique,
  "mime_type" text not null,
  "tamanho_bytes" bigint not null,
  "legenda" text,
  "created_at" timestamp with time zone not null default now()
);

create index "idx_capsula_fotos_capsula" on "capsula_fotos" ("capsula_id");
create index "idx_capsula_fotos_created" on "capsula_fotos" ("created_at");
