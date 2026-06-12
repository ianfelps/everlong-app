type Props = {
  size?: number;
  label?: string;
  className?: string;
};

export function LoadingSpinner({
  size = 16,
  label = 'Carregando',
  className = '',
}: Props) {
  return (
    <span
      className={`loading-spinner ${className}`.trim()}
      style={{ width: size, height: size }}
      role="status"
      aria-label={label}
    >
      <span className="sr-only">{label}</span>
    </span>
  );
}
