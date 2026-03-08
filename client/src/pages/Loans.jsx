import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { formatCurrency, formatDate } from '../utils/formatters';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import { SkeletonTable } from '../components/Skeleton';
import { Plus, Eye, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const STATUS_FILTERS = ['', 'active', 'pending', 'closed', 'defaulted'];

export default function Loans() {
  const [loans, setLoans] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isViewer } = useAuth();

  const fetchLoans = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/loans', { params });
      setLoans(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load loans');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchLoans(1); }, [fetchLoans]);

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <div className="page-title">Loan Management</div>
          <div className="page-subtitle">{pagination.total} loans in portfolio</div>
        </div>
        {!isViewer() && (
          <button className="btn btn-primary" onClick={() => navigate('/loans/new')}>
            <Plus size={16} /> Create Loan
          </button>
        )}
      </div>

      <div className="card">
        {/* Filter tabs */}
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
          <div className="tabs" style={{ flex: 'none' }}>
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                className={`tab-btn${statusFilter === s ? ' active' : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {s === '' ? 'All Loans' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <span className="text-sm text-muted" style={{ marginLeft: 'auto' }}>{pagination.total} results</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Loan No</th>
                <th>Group Name</th>
                <th>Center / Village</th>
                <th>Group Head</th>
                <th>Principal</th>
                <th>EMI / Month</th>
                <th>Outstanding</th>
                <th>Status</th>
                <th>Disbursed</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8}><SkeletonTable rows={8} cols={8} /></td></tr>
              ) : loans.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-state-icon">💳</div>
                      <h3>No loans found</h3>
                      <p>{statusFilter ? `No ${statusFilter} loans.` : 'Create your first loan to get started.'}</p>
                      {!isViewer() && !statusFilter && (
                        <button className="btn btn-primary mt-4" onClick={() => navigate('/loans/new')}>
                          <Plus size={15} /> Create Loan
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : loans.map((l) => (
                <tr key={l._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/loans/${l._id}`)}>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace', fontSize: 13 }}>
                      {l.loanNumber}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{l.groupId?.groupName || '-'}</span>
                  </td>
                  <td>
                    <div className="text-sm">{l.groupId?.center || '-'}</div>
                    <div className="text-xs text-muted">{l.groupId?.village || '-'}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar avatar-sm">{(l.groupId?.groupHead?.name || 'G')[0]?.toUpperCase()}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{l.groupId?.groupHead?.name || '-'}</div>
                        <div className="text-xs text-muted">{l.groupId?.groupHead?.phone || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 700 }}>{formatCurrency(l.principal)}</td>
                  <td style={{ fontWeight: 500 }}>{formatCurrency(l.emiAmount)}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: l.outstandingBalance > 0 ? 'var(--warning)' : 'var(--success)' }}>
                      {formatCurrency(l.outstandingBalance)}
                    </span>
                  </td>
                  <td><StatusBadge status={l.status} /></td>
                  <td className="text-sm text-muted">{formatDate(l.disbursedAt)}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button className="btn btn-xs btn-secondary btn-icon" onClick={() => navigate(`/loans/${l._id}`)}>
                      <Eye size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card-footer">
          <span className="text-sm text-muted">
            {loans.length > 0 && `Page ${pagination.page} of ${pagination.pages}`}
          </span>
          <Pagination page={pagination.page} pages={pagination.pages} onPageChange={fetchLoans} />
        </div>
      </div>
    </div>
  );
}
