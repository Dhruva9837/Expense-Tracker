import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { formatCurrency } from '../utils/formatters';
import Pagination from '../components/Pagination';
import { SkeletonTable } from '../components/Skeleton';
import { Plus, Users, Trash2, Search, Filter, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import StatusBadge from '../components/StatusBadge';

export default function Groups() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ village: '', status: '' });
  const navigate = useNavigate();
  const { isViewer } = useAuth();
  const queryClient = useQueryClient();

  // Fetch groups using TanStack Query
  const { data, isLoading, isPlaceholderData, refetch } = useQuery({
    queryKey: ['groups', page, search, filters],
    queryFn: async () => {
      const params = { page, limit: 10, search, ...filters };
      const res = await api.get('/groups', { params });
      return res.data;
    },
    placeholderData: (previousData) => previousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/groups/${id}`),
    onSuccess: () => {
      toast.success('Group deleted successfully');
      queryClient.invalidateQueries(['groups']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete group');
    }
  });

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this group?')) return;
    deleteMutation.mutate(id);
  };

  const groups = data?.data || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <div className="page-title">Groups Management</div>
          <div className="page-subtitle">{pagination.total} groups available</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary btn-icon" onClick={() => refetch()} title="Refresh">
            <RefreshCw size={16} />
          </button>
          {!isViewer() && (
            <button className="btn btn-primary" onClick={() => navigate('/groups/new')}>
              <Plus size={16} /> Create Group
            </button>
          )}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="card card-body" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="input-group" style={{ flex: 1, minWidth: 250 }}>
            <span className="input-group-icon"><Search size={16} /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, center, village..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Filter size={14} className="text-muted" />
              <select
                className="form-control"
                style={{ width: 140 }}
                value={filters.status}
                onChange={(e) => { setFilters(prev => ({ ...prev, status: e.target.value })); setPage(1); }}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <input
              type="text"
              className="form-control"
              placeholder="Village..."
              style={{ width: 140 }}
              value={filters.village}
              onChange={(e) => { setFilters(prev => ({ ...prev, village: e.target.value })); setPage(1); }}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Group & Center</th>
                <th>Group Head</th>
                <th>Center details</th>
                <th>Risk</th>
                <th>Status</th>
                <th>Members</th>
                {!isViewer() && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7}><SkeletonTable rows={6} cols={7} /></td></tr>
              ) : groups.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-state-icon">👥</div>
                      <h3>No groups found</h3>
                      <p>Try adjusting your search or create a new group.</p>
                    </div>
                  </td>
                </tr>
              ) : groups.map((g) => (
                <tr key={g._id} style={{ cursor: 'pointer', opacity: isPlaceholderData ? 0.6 : 1 }} onClick={() => navigate(`/groups/${g._id}`)}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 15 }}>{g.groupName}</div>
                    <div className="text-xs text-muted" style={{ fontFamily: 'monospace' }}>{g.centerCode || 'NO-CODE'}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar avatar-sm"><Users size={14} /></div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{g.groupHead?.name}</div>
                        <div className="text-xs text-muted">{g.groupHead?.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm font-semibold">{g.centerName}</div>
                    <div className="text-xs text-muted">No: {g.centerNumber} | {g.village}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: g.riskCategory === 'high' ? 'var(--danger)' : g.riskCategory === 'moderate' ? 'var(--warning)' : 'var(--success)'
                      }} />
                      <span className="text-xs font-bold uppercase">{g.riskCategory || 'low'}</span>
                    </div>
                  </td>
                  <td><StatusBadge status={g.status || 'active'} /></td>
                  <td><span className="badge badge-info">{g.members?.length || 0} Members</span></td>
                  {!isViewer() && (
                    <td>
                      <button className="btn btn-icon btn-ghost text-danger" onClick={(e) => handleDelete(e, g._id)} title="Delete Group">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card-footer">
          <span className="text-sm text-muted">
            {groups.length > 0 && `Page ${pagination.page} of ${pagination.pages}`}
          </span>
          <Pagination page={pagination.page} pages={pagination.pages} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
