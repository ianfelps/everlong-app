import { sql } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  bigint,
  index,
  check,
} from 'drizzle-orm/pg-core';

export const configCasal = pgTable(
  'config_casal',
  {
    id: boolean('id').primaryKey().default(true),
    dataInicio: timestamp('data_inicio', { withTimezone: true }).notNull(),
    cartaSecreta: text('carta_secreta'),
    spotifyPlaylistId: text('spotify_playlist_id'),
  },
  (t) => [check('chk_config_singleton', sql`${t.id} = true`)],
);

export const perfis = pgTable('perfis', {
  id: uuid('id').primaryKey().defaultRandom(),
  nome: text('nome').notNull().unique(),
  senhaHash: text('senha_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const fotos = pgTable(
  'fotos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    autorId: uuid('autor_id').references(() => perfis.id, {
      onDelete: 'set null',
    }),
    driveFileId: text('drive_file_id').notNull().unique(),
    mimeType: text('mime_type').notNull(),
    tamanhoBytes: bigint('tamanho_bytes', { mode: 'bigint' }).notNull(),
    legenda: text('legenda'),
    tiradaEm: timestamp('tirada_em', { withTimezone: true }),
    uploadedAt: timestamp('uploaded_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index('idx_fotos_tirada_em').on(sql`${t.tiradaEm} desc nulls last`),
  ],
);

export const eventos = pgTable(
  'eventos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    titulo: text('titulo').notNull(),
    descricao: text('descricao'),
    dataEvento: timestamp('data_evento', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index('idx_eventos_data').on(sql`${t.dataEvento} desc`),
  ],
);

export const capsulas = pgTable(
  'capsulas',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    autorId: uuid('autor_id')
      .notNull()
      .references(() => perfis.id, { onDelete: 'restrict' }),
    titulo: text('titulo').notNull(),
    conteudo: text('conteudo').notNull(),
    dataCriacao: timestamp('data_criacao', { withTimezone: true })
      .notNull()
      .defaultNow(),
    dataDesbloqueio: timestamp('data_desbloqueio', {
      withTimezone: true,
    }).notNull(),
    abertaEm: timestamp('aberta_em', { withTimezone: true }),
  },
  (t) => [
    index('idx_capsulas_desbloq').on(t.dataDesbloqueio),
    check(
      'chk_desbloq_futuro',
      sql`${t.dataDesbloqueio} > ${t.dataCriacao}`,
    ),
  ],
);

export const capsulaFotos = pgTable(
  'capsula_fotos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    capsulaId: uuid('capsula_id')
      .notNull()
      .references(() => capsulas.id, { onDelete: 'cascade' }),
    driveFileId: text('drive_file_id').notNull().unique(),
    mimeType: text('mime_type').notNull(),
    tamanhoBytes: bigint('tamanho_bytes', { mode: 'bigint' }).notNull(),
    legenda: text('legenda'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index('idx_capsula_fotos_capsula').on(t.capsulaId),
    index('idx_capsula_fotos_created').on(t.createdAt),
  ],
);

export const recados = pgTable(
  'recados',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    autorId: uuid('autor_id')
      .notNull()
      .references(() => perfis.id, { onDelete: 'cascade' }),
    conteudo: text('conteudo').notNull(),
    cor: text('cor').notNull().default('amarelo'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index('idx_recados_created').on(sql`${t.createdAt} desc`)],
);

export type Perfil = typeof perfis.$inferSelect;
export type NovoPerfil = typeof perfis.$inferInsert;
export type Foto = typeof fotos.$inferSelect;
export type NovaFoto = typeof fotos.$inferInsert;
export type Evento = typeof eventos.$inferSelect;
export type NovoEvento = typeof eventos.$inferInsert;
export type Capsula = typeof capsulas.$inferSelect;
export type NovaCapsula = typeof capsulas.$inferInsert;
export type CapsulaFoto = typeof capsulaFotos.$inferSelect;
export type NovaCapsulaFoto = typeof capsulaFotos.$inferInsert;
export type Recado = typeof recados.$inferSelect;
export type NovoRecado = typeof recados.$inferInsert;
export type ConfigCasal = typeof configCasal.$inferSelect;
