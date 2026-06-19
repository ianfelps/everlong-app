import { sql } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  bigint,
  integer,
  smallint,
  index,
  check,
  unique,
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

export const filmes = pgTable(
  'filmes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tmdbId: integer('tmdb_id').notNull().unique(),
    titulo: text('titulo').notNull(),
    posterPath: text('poster_path'),
    ano: integer('ano'),
    sinopse: text('sinopse'),
    adicionadoPor: uuid('adicionado_por').references(() => perfis.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index('idx_filmes_created').on(sql`${t.createdAt} desc`)],
);

export const filmeAvaliacoes = pgTable(
  'filme_avaliacoes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    filmeId: uuid('filme_id')
      .notNull()
      .references(() => filmes.id, { onDelete: 'cascade' }),
    autorId: uuid('autor_id')
      .notNull()
      .references(() => perfis.id, { onDelete: 'cascade' }),
    nota: smallint('nota').notNull(),
    texto: text('texto'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique('uq_aval_filme_autor').on(t.filmeId, t.autorId),
    check('chk_nota', sql`${t.nota} between 1 and 5`),
  ],
);

export const filmeFavoritos = pgTable(
  'filme_favoritos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    filmeId: uuid('filme_id')
      .notNull()
      .references(() => filmes.id, { onDelete: 'cascade' }),
    autorId: uuid('autor_id')
      .notNull()
      .references(() => perfis.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique('uq_fav_filme_autor').on(t.filmeId, t.autorId)],
);

export const assistidosJuntos = pgTable(
  'assistidos_juntos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    filmeId: uuid('filme_id')
      .notNull()
      .unique()
      .references(() => filmes.id, { onDelete: 'cascade' }),
    dataAssistido: timestamp('data_assistido', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index('idx_assistidos_data').on(
      sql`${t.dataAssistido} desc nulls last`,
    ),
  ],
);

export const filmeWatchlist = pgTable(
  'filme_watchlist',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    filmeId: uuid('filme_id')
      .notNull()
      .unique()
      .references(() => filmes.id, { onDelete: 'cascade' }),
    adicionadoPor: uuid('adicionado_por').references(() => perfis.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index('idx_watchlist_created').on(sql`${t.createdAt} desc`)],
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
export type Filme = typeof filmes.$inferSelect;
export type NovoFilme = typeof filmes.$inferInsert;
export type FilmeAvaliacao = typeof filmeAvaliacoes.$inferSelect;
export type NovaFilmeAvaliacao = typeof filmeAvaliacoes.$inferInsert;
export type FilmeFavorito = typeof filmeFavoritos.$inferSelect;
export type NovoFilmeFavorito = typeof filmeFavoritos.$inferInsert;
export type AssistidoJunto = typeof assistidosJuntos.$inferSelect;
export type NovoAssistidoJunto = typeof assistidosJuntos.$inferInsert;
export type FilmeWatchlist = typeof filmeWatchlist.$inferSelect;
export type NovoFilmeWatchlist = typeof filmeWatchlist.$inferInsert;
export type ConfigCasal = typeof configCasal.$inferSelect;
