'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shuffle } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { mesAno } from '@/lib/format';
import { BuscaFilmes } from './BuscaFilmes';
import { FilmeCard } from './FilmeCard';
import { FilmeDetailModal } from './FilmeDetailModal';
import type { Aba, FilmeResumo } from './types';

const ABAS: { id: Aba; label: string }[] = [
  { id: 'catalogo', label: 'Catálogo' },
  { id: 'favoritos', label: 'Favoritos' },
  { id: 'watchlist', label: 'Assistir depois' },
  { id: 'assistidos', label: 'Assistidos juntos' },
];

const VAZIO: Record<Aba, { line: string; title: string }> = {
  catalogo: {
    line: 'Toda história de amor tem uma trilha de filmes.',
    title: 'Nenhum filme no catálogo ainda',
  },
  favoritos: {
    line: 'Os filmes que tocaram o coração de vocês ficam aqui.',
    title: 'Ainda sem favoritos',
  },
  watchlist: {
    line: 'A próxima sessão de vocês começa por aqui.',
    title: 'Lista de "assistir depois" vazia',
  },
  assistidos: {
    line: 'Sessões a dois viram memória.',
    title: 'Nenhum filme assistido juntos ainda',
  },
};

function dataAssistido(f: FilmeResumo): string {
  return f.assistidoJunto?.dataAssistido ?? f.assistidoJunto?.createdAt ?? '';
}

export function FilmesView({
  filmes,
  perfis,
  meuId,
}: {
  filmes: FilmeResumo[];
  perfis: Record<string, string>;
  meuId: string;
}) {
  const router = useRouter();
  const [aba, setAba] = useState<Aba>('catalogo');
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);

  const existentes = useMemo(
    () => new Set(filmes.map((f) => f.tmdbId)),
    [filmes],
  );

  const visiveis = useMemo(() => {
    if (aba === 'favoritos') return filmes.filter((f) => f.favoritos.length > 0);
    if (aba === 'watchlist') return filmes.filter((f) => f.naWatchlist);
    if (aba === 'assistidos') return filmes.filter((f) => f.assistidoJunto != null);
    return filmes;
  }, [filmes, aba]);

  // assistidos: agrupados por mês, cronológico (mês e itens mais recentes primeiro)
  const gruposAssistidos = useMemo(() => {
    const map = new Map<string, FilmeResumo[]>();
    for (const f of visiveis) {
      const key = dataAssistido(f).slice(0, 7) || '0000-00';
      (map.get(key) ?? map.set(key, []).get(key)!).push(f);
    }
    return [...map.keys()]
      .sort((a, b) => b.localeCompare(a))
      .map((key) => ({
        key,
        label: key === '0000-00' ? 'Sem data' : mesAno(`${key}-01T12:00:00`),
        filmes: map
          .get(key)!
          .sort((a, b) => dataAssistido(b).localeCompare(dataAssistido(a))),
      }));
  }, [visiveis]);

  const selecionado = filmes.find((f) => f.id === selecionadoId) ?? null;
  const watchlist = useMemo(() => filmes.filter((f) => f.naWatchlist), [filmes]);

  function refresh() {
    router.refresh();
  }

  function sortear() {
    if (watchlist.length === 0) return;
    const escolhido = watchlist[Math.floor(Math.random() * watchlist.length)];
    if (escolhido) setSelecionadoId(escolhido.id);
  }

  function card(filme: FilmeResumo) {
    return (
      <FilmeCard
        key={filme.id}
        filme={filme}
        meuId={meuId}
        onOpen={() => setSelecionadoId(filme.id)}
      />
    );
  }

  const vazio = visiveis.length === 0;

  return (
    <div className="page shell fade-in">
      <div className="page-head">
        <h1 className="page-title">Filmes</h1>
        <p className="page-sub">
          O nosso cinema: avaliações, favoritos e as sessões de nós dois.
        </p>
      </div>

      <BuscaFilmes existentes={existentes} onAdded={refresh} />

      <div className="album-bar filme-bar">
        <div className="filme-tabs">
          {ABAS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`filme-tab ${aba === t.id ? 'is-active' : ''}`}
              onClick={() => setAba(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {aba === 'watchlist' && watchlist.length > 0 && (
          <button type="button" className="btn btn-primary" onClick={sortear}>
            <Shuffle size={16} /> Sortear
          </button>
        )}
      </div>

      {vazio ? (
        <EmptyState line={VAZIO[aba].line} title={VAZIO[aba].title} />
      ) : aba === 'assistidos' ? (
        <div className="filme-meses">
          {gruposAssistidos.map((g) => (
            <section className="filme-mes-grupo" key={g.key}>
              <h2 className="filme-mes-titulo">{g.label}</h2>
              <div className="filme-grid">{g.filmes.map(card)}</div>
            </section>
          ))}
        </div>
      ) : (
        <div className="filme-grid">{visiveis.map(card)}</div>
      )}

      {selecionado && (
        <FilmeDetailModal
          filme={selecionado}
          meuId={meuId}
          perfis={perfis}
          onClose={() => setSelecionadoId(null)}
          onChanged={refresh}
        />
      )}
    </div>
  );
}
