alter table "config_casal" add column if not exists "carta_secreta" text;
drop trigger if exists "trg_config_updated" on "config_casal";
alter table "config_casal" drop column if exists "drive_folder_id";
alter table "config_casal" drop column if exists "created_at";
alter table "config_casal" drop column if exists "updated_at";

drop index if exists "idx_fotos_fase";
drop index if exists "idx_eventos_fase";
drop index if exists "uq_fases_ordem";

alter table "capsulas" drop column if exists "destinatario_id";
alter table "eventos" drop column if exists "foto_id";
alter table "eventos" drop column if exists "icone";
alter table "eventos" drop column if exists "fase_id";
alter table "fotos" drop column if exists "fase_id";
alter table "fotos" drop column if exists "largura";
alter table "fotos" drop column if exists "altura";
alter table "perfis" drop column if exists "avatar_url";
alter table "recados" drop column if exists "posicao_x";
alter table "recados" drop column if exists "posicao_y";
alter table "recados" drop column if exists "rotacao";

drop table if exists "fases";
