import { useState, useEffect } from 'react';
import api from '../api/axios';
import { formatDateTime } from '../utils/formatters';
import { SkeletonTable } from '../components/Skeleton';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';
import { Shield } from 'lucide-react';

const ACTION_STYLES = {
  DELETE: { bg: 'rgba(239,68,68,0.1)', text: '#ef4444' },
  CREATE: { bg: 'rgba(16,185,129,0.1)', text: '#10b981' },
  LOGIN: { bg: 'rgba(16,185,129,0.1)', text: '#10b981' },
  UPDATE: { bg: 'rgba(59,130,246,0.1)', text: '#3b82f6' },
  PAYMENT: { bg: 'rgba(99,102,241,0.1)', text: '#6366f1' },
  STATUS: { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b' },
};

const getActionStyle = (action) => {
  if (!action) return { bg: 'var(--bg)', text: 'var(--text-muted)' };
  for (const key of Object.keys(ACTION_STYLES)) {
    if (action.toUpperCase().includes(key)) return ACTION_STYLES[key];
  }
  return { bg: 'var(--bg)', text: 'var(--text-muted)' };
};

const RESOURCE_FILTERS = ['', 'Client', 'Loan', 'Payment', 'User'];

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState('');

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (resource) params.resource = resource;
      const res = await api.get('/audit', { params });
      setLogs(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load audit logs'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(1); }, [resource]);

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <div className="page-title">Audit Logs</div>
          <div className="page-subtitle">Full compliance trail of all system activity</div>
        </div>
        <div className="chip">
          <Shield size={13} />
          {pagination.total} entries
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="tabs">
            {RESOURCE_FILTERS.map((r) => (
              <button
                key={r}
                className={`tab-btn${resource === r ? ' active' : ''}`}
                onClick={() => setResource(r)}
              >
                {r || 'All Events'}
              </button>
            ))}
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5}><SkeletonTable rows={8} cols={5} /></td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5}>
                  <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <h3>No audit logs</h3>
                    <p>No events recorded for this filter.</p>
                  </div>
                </td></tr>
              ) : logs.map((log) => {
                const style = getActionStyle(log.action);
                return (
                  <tr key={log._id}>
                    <td className="text-xs text-muted" style={{ whiteSpace: 'nowrap' }}>
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="avatar avatar-sm" style={{ width: 26, height: 26, fontSize: 10 }}>
                          {log.userName?.[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{log.userName || '—'}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: style.text,
                        background: style.bg,
                        padding: '3px 9px',
                        borderRadius: 999,
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td><span className="chip" style={{ fontSize: 11 }}>{log.resource}</span></td>
                    <td className="text-sm text-muted">{log.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="card-footer">
          <span className="text-sm text-muted">Page {pagination.page} of {pagination.pages}</span>
          <Pagination page={pagination.page} pages={pagination.pages} onPageChange={fetchLogs} />
        </div>
      </div>
    </div>
  );
}
