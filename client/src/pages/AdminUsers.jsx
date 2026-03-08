import { useState, useEffect } from 'react';
import api from '../api/axios';
import { formatDateTime } from '../utils/formatters';
import { Plus, UserX, UserCheck, X, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { SkeletonTable } from '../components/Skeleton';

const ROLE_COLORS = {
  admin: { bg: 'rgba(99,102,241,0.1)', text: '#6366f1' },
  staff: { bg: 'rgba(16,185,129,0.1)', text: '#10b981' },
  viewer: { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b' },
};

const RoleBadge = ({ role }) => {
  const c = ROLE_COLORS[role] || { bg: 'var(--bg)', text: 'var(--text-muted)' };
  return (
    <span className="badge" style={{ background: c.bg, color: c.text }}>
      {role}
    </span>
  );
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff' });
  const [saving, setSaving] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    api.get('/users').then((r) => setUsers(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(fetchUsers, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/users', form);
      toast.success('User created successfully');
      setShowForm(false);
      setForm({ name: '', email: '', password: '', role: 'staff' });
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create user'); }
    finally { setSaving(false); }
  };

  const toggleActive = async (user) => {
    try {
      await api.put(`/users/${user._id}`, { isActive: !user.isActive });
      toast.success(user.isActive ? 'User deactivated' : 'User activated');
      fetchUsers();
    } catch { toast.error('Failed to update user'); }
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <div className="page-title">User Management</div>
          <div className="page-subtitle">Manage system users and access permissions</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X size={15} /> Cancel</> : <><Plus size={15} /> Add User</>}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card card-body" style={{ marginBottom: 20, borderTop: `3px solid var(--primary)` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={16} color="var(--primary)" />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: 15 }}>Create New User</h3>
          </div>
          <form onSubmit={handleCreate}>
            <div className="grid-2" style={{ marginBottom: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name *</label>
                <input className="form-control" required placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email Address *</label>
                <input className="form-control" type="email" required placeholder="user@pahel.io" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Password *</label>
                <input className="form-control" type="password" required minLength={6} placeholder="min. 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Role *</label>
                <select className="form-control" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="admin">Admin — Full Access</option>
                  <option value="staff">Staff — Create & Edit</option>
                  <option value="viewer">Viewer — Read Only</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <div className="spinner" /> : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6}><SkeletonTable rows={5} cols={6} /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6}>
                  <div className="empty-state"><div className="empty-state-icon">👥</div><h3>No users found</h3></div>
                </td></tr>
              ) : users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar avatar-sm">{u.name?.[0]?.toUpperCase()}</div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                    </div>
                  </td>
                  <td className="text-sm text-muted">{u.email}</td>
                  <td><RoleBadge role={u.role} /></td>
                  <td>
                    <span className={`badge ${u.isActive ? 'badge-active' : 'badge-closed'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="text-sm text-muted">{u.lastLogin ? formatDateTime(u.lastLogin) : 'Never'}</td>
                  <td>
                    <button
                      className={`btn btn-xs ${u.isActive ? 'btn-danger' : 'btn-success'} btn-icon`}
                      onClick={() => toggleActive(u)}
                      title={u.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {u.isActive ? <UserX size={13} /> : <UserCheck size={13} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
