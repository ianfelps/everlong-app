import { sql } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  date,
  integer,
  bigint,
  index,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core';

export const configCasal = pgTable(
  'config_casal',
  {
    id: boolean('id').primaryKey().default(true),
    dataInicio: timestamp('data_inicio', { withTimezone: true }).notNull(),
    driveFolderId: text('drive_folder_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [check('chk_config_singleton', sql`${t.id} = true`)],
);

export const perfis = pgTable('perfis', {
  id: uuid('id').primaryKey().defaultRandom(),
  nome: text('nome').notNull().unique(),
  senhaHash: text('senha_hash').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const fases = pgTable(
  'fases',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    nome: text('nome').notNull(),
    descricao: text('descricao'),
    dataInicio: date('data_inicio').notNull(),
    dataFim: date('data_fim'),
    ordem: integer('ordem').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex('uq_fases_ordem').on(t.ordem),
    check(
      'chk_fase_datas',
      sql`${t.dataFim} is null or ${t.dataFim} >= ${t.dataInicio}`,
    ),
  ],
);

export const fotos = pgTable(
  'fotos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    faseId: uuid('fase_id').references(() => fases.id, { onDelete: 'set null' }),
    autorId: uuid('autor_id').references(() => perfis.id, {
      onDelete: 'set null',
    }),
    driveFileId: text('drive_file_id').notNull().unique(),
    mimeType: text('mime_type').notNull(),
    tamanhoBytes: bigint('tamanho_bytes', { mode: 'bigint' }).notNull(),
    largura: integer('largura'),
    altura: integer('altura'),
    legenda: text('legenda'),
    tiradaEm: timestamp('tirada_em', { withTimezone: true }),
    uploadedAt: timestamp('uploaded_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index('idx_fotos_tirada_em').on(sql`${t.tiradaEm} desc nulls last`),
    index('idx_fotos_fase').on(t.faseId),
  ],
);

export const eventos = pgTable(
  'eventos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    faseId: uuid('fase_id').references(() => fases.id, { onDelete: 'set null' }),
    fotoId: uuid('foto_id').references(() => fotos.id, { onDelete: 'set null' }),
    titulo: text('titulo').notNull(),
    descricao: text('descricao'),
    dataEvento: timestamp('data_evento', { withTimezone: true }).notNull(),
    icone: text('icone'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index('idx_eventos_data').on(sql`${t.dataEvento} desc`),
    index('idx_eventos_fase').on(t.faseId),
  ],
);

export const capsulas = pgTable(
  'capsulas',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    autorId: uuid('autor_id')
      .notNull()
      .references(() => perfis.id, { onDelete: 'restrict' }),
    destinatarioId: uuid('destinatario_id').references(() => perfis.id, {
      onDelete: 'set null',
    }),
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

export const recados = pgTable(
  'recados',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    autorId: uuid('autor_id')
      .notNull()
      .references(() => perfis.id, { onDelete: 'cascade' }),
    conteudo: text('conteudo').notNull(),
    cor: text('cor').notNull().default('amarelo'),
    posicaoX: integer('posicao_x').notNull().default(0),
    posicaoY: integer('posicao_y').notNull().default(0),
    rotacao: integer('rotacao').notNull().default(0),
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
export type Fase = typeof fases.$inferSelect;
export type NovaFase = typeof fases.$inferInsert;
export type Foto = typeof fotos.$inferSelect;
export type NovaFoto = typeof fotos.$inferInsert;
export type Evento = typeof eventos.$inferSelect;
export type NovoEvento = typeof eventos.$inferInsert;
export type Capsula = typeof capsulas.$inferSelect;
export type NovaCapsula = typeof capsulas.$inferInsert;
export type Recado = typeof recados.$inferSelect;
export type NovoRecado = typeof recados.$inferInsert;
export type ConfigCasal = typeof configCasal.$inferSelect;
