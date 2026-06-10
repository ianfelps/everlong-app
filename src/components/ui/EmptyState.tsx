import { MetalSphere } from '@/components/brand/MetalSphere';

type Props = {
  title: string;
  line: string;
  hint?: string;
  cta?: string;
  onCta?: () => void;
};

export function EmptyState({ title, line, hint, cta, onCta }: Props) {
  return (
    <div className="empty fade-in">
      <div className="empty-orb">
        <MetalSphere size={68} />
      </div>
      <p className="serif-note empty-line">{line}</p>
      <h3 className="empty-title">{title}</h3>
      {hint && (
        <p className="mono" style={{ fontSize: 12, color: 'var(--ink-faint)' }}>
          {hint}
        </p>
      )}
      {cta && (
        <button className="btn btn-primary" onClick={onCta}>
          {cta}
        </button>
      )}
    </div>
  );
}
