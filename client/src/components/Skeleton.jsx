const Skeleton = ({ height = 16, width = '100%', rounded = false, className = '' }) => (
  <div
    className={`skeleton ${className}`}
    style={{ height, width, borderRadius: rounded ? 999 : undefined }}
  />
);

export const SkeletonCard = () => (
  <div className="kpi-card">
    <div className="skeleton" style={{ width: 50, height: 50, borderRadius: 14, flexShrink: 0 }} />
    <div style={{ flex: 1 }}>
      <Skeleton height={12} width="60%" />
      <div style={{ marginTop: 8 }}><Skeleton height={24} width="80%" /></div>
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 5 }) => (
  <div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} style={{ display: 'flex', gap: 16, padding: '14px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
        <div className="skeleton" style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0 }} />
        {Array.from({ length: cols - 1 }).map((_, j) => (
          <Skeleton key={j} height={14} width={`${60 + (j * 10) % 40}%`} />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonText = ({ lines = 3 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} height={14} width={i === lines - 1 ? '60%' : '100%'} />
    ))}
  </div>
);

export default Skeleton;
