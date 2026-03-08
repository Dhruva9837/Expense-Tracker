import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pages, onPageChange }) {
  if (!pages || pages <= 1) return null;

  const getRange = () => {
    const delta = 1;
    const range = [];
    const left = Math.max(1, page - delta);
    const right = Math.min(pages, page + delta);

    if (left > 1) { range.push(1); if (left > 2) range.push('…'); }
    for (let i = left; i <= right; i++) range.push(i);
    if (right < pages) { if (right < pages - 1) range.push('…'); range.push(pages); }
    return range;
  };

  return (
    <div className="pagination">
      <button
        className="page-btn"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        title="Previous"
      >
        <ChevronLeft size={14} />
      </button>

      {getRange().map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} className="page-btn" style={{ cursor: 'default', border: 'none', opacity: 0.5 }}>…</span>
        ) : (
          <button
            key={p}
            className={`page-btn${p === page ? ' active' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        )
      )}

      <button
        className="page-btn"
        disabled={page >= pages}
        onClick={() => onPageChange(page + 1)}
        title="Next"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
