import type { ShoeStatus } from '../types';

interface StatusBadgeProps {
  status: ShoeStatus;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<ShoeStatus, { label: string; bg: string; border: string; text: string; dot: string }> = {
  en_bodega: {
    label: 'En Bodega',
    bg: '#F0F5EE',
    border: '#8FA886',
    text: '#3D6B38',
    dot: '#5B8A54',
  },
  prestado: {
    label: 'Prestado',
    bg: '#FDF4E7',
    border: '#C49A3A',
    text: '#7A5C0F',
    dot: '#C49A3A',
  },
  vendido: {
    label: 'Vendido',
    bg: '#F2F0EE',
    border: '#9E9690',
    text: '#5A554F',
    dot: '#9E9690',
  },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  const px = size === 'sm' ? '6px 9px' : '4px 10px';
  const fs = size === 'sm' ? '11px' : '12px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: px,
        borderRadius: 100,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.text,
        fontSize: fs,
        fontWeight: 500,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}
