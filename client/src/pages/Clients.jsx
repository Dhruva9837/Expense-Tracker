import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { formatDate } from '../utils/formatters';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import { SkeletonTable } from '../components/Skeleton';
import { Plus, Search, Eye, Trash2, Filter, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isViewer } = useAuth();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchClients = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await api.get('/clients', { params });
      setClients(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => { fetchClients(1); }, [fetchClients]);

  const deleteClient = async (id) => {
    if (!window.confirm('Delete this client? This cannot be undone.')) return;
    try {
      await api.delete(`/clients/${id}`);
      toast.success('Client deleted');
      fetchClients(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <div className="page-title">Client Management</div>
          <div className="page-subtitle">{pagination.total} registered borrowers</div>
        </div>
        {!isViewer() && (
          <button className="btn btn-primary" onClick={() => navigate('/clients/new')}>
            <Plus size={16} /> Add Client
          </button>
        )}
      </div>

      <div className="card">
        {/* Table toolbar */}
        <div className="card-header" style={{ gap: 16 }}>
          <div className="search-bar">
            <Search size={14} className="search-icon" />
            <input
              className="form-control"
              placeholder="Search name, phone, Aadhaar…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ height: 38, fontSize: 13 }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
            <span className="text-sm text-muted">{pagination.total} results</span>
          </div>
        </div>

        {/* Table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Phone</th>
                <th>Aadhaar</th>
                <th>City</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6}><SkeletonTable rows={8} cols={6} /></td></tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-state-icon">👤</div>
                      <h3>No clients found</h3>
                      <p>{search ? 'Try a different search term.' : 'Add your first client to get started.'}</p>
                      {!isViewer() && !search && (
                        <button className="btn btn-primary mt-4" onClick={() => navigate('/clients/new')}>
                          <Plus size={15} /> Add Client
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : clients.map((c) => (
                <tr key={c._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/clients/${c._id}`)}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="avatar avatar-sm">
                        {c.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                        <div className="text-xs text-muted">{c.email || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{c.phone}</td>
                  <td><span className="chip" style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.aadhaar}</span></td>
                  <td className="text-sm">{c.address?.city || '—'}</td>
                  <td className="text-sm text-muted">{formatDate(c.createdAt)}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-xs btn-secondary btn-icon"
                        onClick={() => navigate(`/clients/${c._id}`)}
                        title="View"
                      >
                        <Eye size={13} />
                      </button>
                      {!isViewer() && (
                        <button
                          className="btn btn-xs btn-danger btn-icon"
                          onClick={() => deleteClient(c._id)}
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="card-footer">
          <span className="text-sm text-muted">
            {clients.length > 0 && `Showing ${(pagination.page - 1) * 10 + 1}–${Math.min(pagination.page * 10, pagination.total)} of ${pagination.total}`}
          </span>
          <Pagination page={pagination.page} pages={pagination.pages} onPageChange={(p) => fetchClients(p)} />
        </div>
      </div>
    </div>
  );
}
