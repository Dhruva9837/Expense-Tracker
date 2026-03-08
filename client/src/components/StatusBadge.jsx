const STATUS_MAP = {
  active: 'badge-active',
  closed: 'badge-closed',
  pending: 'badge-pending',
  defaulted: 'badge-defaulted',
  overdue: 'badge-overdue',
  paid: 'badge-paid',
  partial: 'badge-partial',
};

export default function StatusBadge({ status }) {
  const cls = STATUS_MAP[status?.toLowerCase()] || 'badge-default';
  return <span className={`badge ${cls}`}>{status || '—'}</span>;
}
