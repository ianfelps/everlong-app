export type AvaliacaoView = {
  id: string;
  autorId: string;
  nota: number;
  texto: string | null;
  updatedAt: string;
};

export type FavoritoView = {
  autorId: string;
};

export type AssistidoView = {
  dataAssistido: string | null;
  createdAt: string;
};

export type FilmeResumo = {
  id: string;
  tmdbId: number;
  titulo: string;
  posterPath: string | null;
  ano: number | null;
  sinopse: string | null;
  avaliacoes: AvaliacaoView[];
  favoritos: FavoritoView[];
  assistidoJunto: AssistidoView | null;
  naWatchlist: boolean;
};

export type ResultadoTmdb = {
  tmdbId: number;
  titulo: string;
  posterPath: string | null;
  ano: number | null;
  sinopse: string | null;
  generos?: string[];
  duracaoMin?: number | null;
  diretor?: string | null;
  elenco?: string[];
  produtoras?: string[];
};

export type Aba = 'catalogo' | 'favoritos' | 'watchlist' | 'assistidos';
