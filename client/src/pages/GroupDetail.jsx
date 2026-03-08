import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { formatDate, formatCurrency } from '../utils/formatters';
import { ArrowLeft, Users, UserPlus, Trash2, Eye, X, MapPin, Map, Calendar, UserCheck, ShieldAlert, TrendingUp, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { SkeletonTable } from '../components/Skeleton';
import StatusBadge from '../components/StatusBadge';

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showRegisterMember, setShowRegisterMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedClient, setSelectedClient] = useState('');

  // Registration Form State
  const [regForm, setRegForm] = useState({
    name: '', phone: '', email: '', aadhaar: '', pan: '',
    dob: '', gender: '', occupation: '', income: '',
    address: { street: '', city: '', state: '', pincode: '' },
    notes: '',
  });

  const fetchGroup = useCallback(async () => {
    try {
      const [groupRes, perfRes] = await Promise.allSettled([
        api.get(`/groups/${id}`),
        api.get(`/groups/${id}/performance`)
      ]);

      if (groupRes.status === 'fulfilled') {
        setGroup(groupRes.value.data.data);
      } else {
        toast.error('Failed to load group details');
        navigate('/groups');
        return;
      }

      if (perfRes.status === 'fulfilled') {
        setPerformance(perfRes.value.data.data);
      } else {
        console.warn('Performance metrics unavailable');
      }
    } catch (err) {
      toast.error('Unexpected error loading group');
      navigate('/groups');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const fetchClients = useCallback(async () => {
    try {
      const res = await api.get('/clients', { params: { limit: 1000 } });
      setClients(res.data.data);
    } catch (err) {
      toast.error('Failed to load clients');
    }
  }, []);

  useEffect(() => {
    fetchGroup();
    fetchClients();
  }, [fetchGroup, fetchClients]);

  const handleAddMember = async () => {
    if (!selectedClient) return toast.error('Please select a client');
    if (group.members.length >= 10) {
      return toast.error('Group has reached the maximum of 10 members');
    }
    if (group.members.some(m => m._id === selectedClient)) {
      return toast.error('Client is already a member of this group');
    }

    try {
      const memberIds = (group.members || []).filter(Boolean).map(m => m._id);
      const updatedMembers = [...memberIds, selectedClient];
      await api.put(`/groups/${id}`, { members: updatedMembers });
      toast.success('Member added successfully');
      setShowAddMember(false);
      setSelectedClient('');
      fetchGroup();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRegisterMember = async (e) => {
    e.preventDefault();
    if (group.members.length >= 10) {
      return toast.error('Group has reached the maximum of 10 members');
    }

    try {
      const payload = { ...regForm, income: regForm.income ? Number(regForm.income) : undefined };
      const res = await api.post('/clients', payload);
      const newClientId = res.data.data._id;

      const memberIds = (group.members || []).filter(Boolean).map(m => m._id);
      const updatedMembers = [...memberIds, newClientId];
      await api.put(`/groups/${id}`, { members: updatedMembers });

      toast.success('Member registered and added to group');
      setShowRegisterMember(false);
      fetchGroup();
      fetchClients();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register member');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (memberId === group.groupHead._id) return toast.error('Cannot remove the Group Head');
    if (!window.confirm('Are you sure you want to remove this member?')) return;

    try {
      const updatedMembers = (group.members || [])
        .filter(m => m && m._id !== memberId)
        .map(m => m._id);
      await api.put(`/groups/${id}`, { members: updatedMembers });
      toast.success('Member removed successfully');
      fetchGroup();
    } catch (err) {
      toast.error('Failed to remove member');
    }
  };

  if (loading) return <div className="page-enter"><SkeletonTable rows={10} cols={4} /></div>;
  if (!group) return null;

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <button className="btn btn-secondary btn-sm" style={{ marginBottom: 10 }} onClick={() => navigate('/groups')}>
            <ArrowLeft size={13} /> Back to Groups
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="page-title">{group.groupName}</div>
            <StatusBadge status={group.status || 'active'} />
          </div>
          <div className="page-subtitle" style={{ fontFamily: 'monospace' }}>CENTER CODE: {group.centerCode || 'PENDING'}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => setShowAddMember(true)} disabled={group.members.length >= 10}>
            <Users size={16} /> Add Existing
          </button>
          <button className="btn btn-primary" onClick={() => setShowRegisterMember(true)} disabled={group.members.length >= 10}>
            <UserPlus size={16} /> Register New
          </button>
        </div>
      </div>

      {/* Performance Metrics */}
      {performance && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="card card-body flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10 text-primary"><TrendingUp size={24} /></div>
            <div>
              <div className="text-xs text-muted font-bold uppercase">Collection Efficiency</div>
              <div className="text-xl font-bold">{performance.collectionEfficiency}%</div>
            </div>
          </div>
          <div className="card card-body flex items-center gap-4">
            <div className="p-3 rounded-full bg-success/10 text-success"><CheckCircle size={24} /></div>
            <div>
              <div className="text-xs text-muted font-bold uppercase">Active Loans</div>
              <div className="text-xl font-bold">{performance.totalActive} / {performance.totalLoans}</div>
            </div>
          </div>
          <div className="card card-body flex items-center gap-4">
            <div className="p-3 rounded-full bg-info/10 text-info"><DollarSign size={24} /></div>
            <div>
              <div className="text-xs text-muted font-bold uppercase">Outstanding Portfolio</div>
              <div className="text-xl font-bold">{formatCurrency(performance.totalOutstanding)}</div>
            </div>
          </div>
          <div className="card card-body flex items-center gap-4">
            <div className="p-3 rounded-full bg-danger/10 text-danger"><AlertCircle size={24} /></div>
            <div>
              <div className="text-xs text-muted font-bold uppercase">Overdue Accounts</div>
              <div className="text-xl font-bold">{performance.overdueCount}</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: 20 }}>
        {/* Group Info Sidebar */}
        <div className="space-y-4">
          <div className="card">
            <div className="card-header"><h3 className="card-title">Group Information</h3></div>
            <div className="card-body">
              <div className="stat-row">
                <span className="stat-label"><MapPin size={14} className="mr-2" /> Center No</span>
                <span className="stat-value">{group.centerNumber}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label"><MapPin size={14} className="mr-2" /> Center Name</span>
                <span className="stat-value">{group.centerName}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label"><Map size={14} className="mr-2" /> Village</span>
                <span className="stat-value">{group.village}</span>
              </div>
              <div className="divider" />
              <div className="stat-row">
                <span className="stat-label"><Calendar size={14} className="mr-2" /> Meeting Day</span>
                <span className="stat-value font-bold text-primary">{group.meetingDay || 'N/A'}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label"><UserCheck size={14} className="mr-2" /> Field Officer</span>
                <span className="stat-value">{group.collectionAgent?.name || 'Unassigned'}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label"><ShieldAlert size={14} className="mr-2" /> Risk Profile</span>
                <span className={`stat-value font-bold uppercase text-xs p-1 px-2 rounded ${group.riskCategory === 'high' ? 'bg-danger/20 text-danger' : group.riskCategory === 'moderate' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'}`}>
                  {group.riskCategory || 'low'}
                </span>
              </div>

              <div style={{ marginTop: 25 }}>
                <h4 className="text-xs font-bold text-muted uppercase mb-3 px-1">Group Head</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div className="avatar avatar-md"><Users size={18} /></div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{group.groupHead?.name || 'Missing Head'}</div>
                    <div className="text-xs text-muted">{group.groupHead?.phone || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">Group Members ({group.members.length}/10)</h3>
            {group.members.length >= 10 && <span className="text-xs font-bold text-danger bg-danger/10 p-1 px-2 rounded">GROUP FULL</span>}
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Member Details</th><th>Phone</th><th>Aadhaar</th><th>Action</th></tr></thead>
              <tbody>
                {(group.members || []).filter(Boolean).map(member => (
                  <tr key={member._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar avatar-xs" style={{ fontSize: 10 }}>{member.name?.[0] || '?'}</div>
                        <div style={{ fontWeight: 600 }}>
                          {member.name}
                          {member._id === group.groupHead?._id && <span className="badge badge-primary ml-2" style={{ fontSize: '9px' }}>HEAD</span>}
                        </div>
                      </div>
                    </td>
                    <td>{member.phone}</td>
                    <td>{member.aadhaar}</td>
                    <td style={{ display: 'flex', gap: 5 }}>
                      <button className="btn btn-icon btn-ghost" onClick={() => setSelectedMember(member)} title="View Member Profile"><Eye size={16} /></button>
                      {member._id !== group.groupHead._id && (
                        <button className="btn btn-icon btn-ghost text-danger" onClick={() => handleRemoveMember(member._id)} title="Remove from group"><Trash2 size={16} /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Existing Member Modal */}
      {showAddMember && (
        <div className="modal-overlay">
          <div className="card" style={{ width: 400, padding: 25 }}>
            <h3 className="card-title mb-4">Add Existing Client</h3>
            <div className="form-group">
              <label className="form-label">Search Client</label>
              <select className="form-control" value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}>
                <option value="">-- Choose Client --</option>
                {clients.map(c => <option key={c._id} value={c._id}>{c.name} ({c.aadhaar})</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn btn-secondary" onClick={() => setShowAddMember(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddMember}>Add to Group</button>
            </div>
          </div>
        </div>
      )}

      {/* Register New Member Modal */}
      {showRegisterMember && (
        <div className="modal-overlay">
          <div className="card" style={{ width: 800, padding: 0, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header" style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1, borderBottom: '1px solid var(--border)' }}>
              <h3 className="card-title">Register New Member</h3>
              <button className="btn btn-icon" onClick={() => setShowRegisterMember(false)} style={{ marginLeft: 'auto' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleRegisterMember} style={{ padding: 25 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Personal Info */}
                <div>
                  <h4 className="section-subtitle">Personal Details</h4>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-control" required value={regForm.name} onChange={(e) => setRegForm({ ...regForm, name: e.target.value })} />
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Phone *</label>
                      <input className="form-control" required value={regForm.phone} onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Gender</label>
                      <select className="form-control" value={regForm.gender} onChange={(e) => setRegForm({ ...regForm, gender: e.target.value })}>
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Aadhaar *</label>
                      <input className="form-control" required value={regForm.aadhaar} onChange={(e) => setRegForm({ ...regForm, aadhaar: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">PAN</label>
                      <input className="form-control" value={regForm.pan} onChange={(e) => setRegForm({ ...regForm, pan: e.target.value.toUpperCase() })} />
                    </div>
                  </div>
                </div>
                {/* Address & Notes */}
                <div>
                  <h4 className="section-subtitle">Address Details</h4>
                  <div className="form-group">
                    <label className="form-label">Street</label>
                    <input className="form-control" value={regForm.address.street} onChange={(e) => setRegForm({ ...regForm, address: { ...regForm.address, street: e.target.value } })} />
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input className="form-control" value={regForm.address.city} onChange={(e) => setRegForm({ ...regForm, address: { ...regForm.address, city: e.target.value } })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Pincode</label>
                      <input className="form-control" value={regForm.address.pincode} onChange={(e) => setRegForm({ ...regForm, address: { ...regForm.address, pincode: e.target.value } })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Notes</label>
                    <textarea className="form-control" rows={3} value={regForm.notes} onChange={(e) => setRegForm({ ...regForm, notes: e.target.value })} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRegisterMember(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Register & Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Details Modal */}
      {selectedMember && (
        <div className="modal-overlay">
          <div className="card" style={{ width: 500, padding: 0 }}>
            <div className="card-header">
              <h3 className="card-title">Member Profile</h3>
              <button className="btn btn-icon" onClick={() => setSelectedMember(null)} style={{ marginLeft: 'auto' }}><X size={20} /></button>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 25 }}>
                <div className="avatar avatar-lg" style={{ width: 60, height: 60, fontSize: 24 }}>{selectedMember.name?.[0]}</div>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{selectedMember.name}</h2>
                  <div className="text-muted">{selectedMember.phone}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                <div className="info-block">
                  <div className="info-label">Aadhaar Number</div>
                  <div className="info-value">{selectedMember.aadhaar}</div>
                </div>
                <div className="info-block">
                  <div className="info-label">PAN Number</div>
                  <div className="info-value">{selectedMember.pan || 'N/A'}</div>
                </div>
                <div className="info-block">
                  <div className="info-label">Gender</div>
                  <div className="info-value" style={{ textTransform: 'capitalize' }}>{selectedMember.gender || 'N/A'}</div>
                </div>
                <div className="info-block">
                  <div className="info-label">Date of Birth</div>
                  <div className="info-value">{selectedMember.dob ? formatDate(selectedMember.dob) : 'N/A'}</div>
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <div className="info-label">Address</div>
                <div className="info-value">
                  {selectedMember.address ? (
                    <>
                      {selectedMember.address.street && <>{selectedMember.address.street}, </>}
                      {selectedMember.address.city && <>{selectedMember.address.city}, </>}
                      {selectedMember.address.state && <>{selectedMember.address.state} </>}
                      {selectedMember.address.pincode && <>- {selectedMember.address.pincode}</>}
                    </>
                  ) : 'N/A'}
                </div>
              </div>

              {selectedMember.notes && (
                <div style={{ marginTop: 20, padding: 12, background: 'var(--bg)', borderRadius: 8, borderLeft: '3px solid var(--primary)' }}>
                  <div className="info-label">Notes</div>
                  <div className="info-value" style={{ fontSize: 13, marginTop: 4 }}>{selectedMember.notes}</div>
                </div>
              )}
            </div>
            <div className="card-footer">
              <button className="btn btn-primary w-full" onClick={() => setSelectedMember(null)} style={{ justifyContent: 'center' }}>Close Profile</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
          display: flex; alignItems: center; justifyContent: center; z-index: 1000;
        }
        .section-subtitle {
          font-size: 14px; font-weight: 700; color: var(--primary);
          text-transform: uppercase; letter-spacing: 0.5px;
          margin: 0 0 15px; padding-bottom: 5px; border-bottom: 1px solid var(--border);
        }
        .info-block { margin-bottom: 15px; }
        .info-label { font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 600; margin-bottom: 3px; }
        .info-value { font-weight: 600; color: var(--text); }
      `}</style>
    </div>
  );
}
