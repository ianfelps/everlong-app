import { LoadingSpinner } from './LoadingSpinner';
import { Skeleton } from './Skeleton';

export function PageLoading({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`page-loading ${compact ? 'is-compact' : ''}`} aria-busy="true">
      <div className="page-loading-head">
        <LoadingSpinner size={18} label="Carregando pagina" />
        <Skeleton style={{ width: 220, height: 28 }} />
        <Skeleton style={{ width: 'min(480px, 82vw)', height: 14 }} />
      </div>
      <div className="page-loading-grid">
        {Array.from({ length: compact ? 3 : 6 }, (_, index) => (
          <div key={index} className="page-loading-card">
            <Skeleton className="page-loading-image" />
            <div className="page-loading-meta">
              <Skeleton style={{ width: index % 2 === 0 ? '72%' : '58%', height: 12 }} />
              <Skeleton style={{ width: 92, height: 9 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
