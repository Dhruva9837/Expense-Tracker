import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Save, Users, UserPlus, MapPin, Map, Calendar, UserCheck, ShieldAlert, Activity, Search, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GroupNew() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    groupName: '',
    centerNumber: '',
    centerName: '',
    village: '',
    centerCode: '',
    meetingDay: 'Monday',
    collectionAgent: '',
    riskCategory: 'low',
    status: 'active',
    groupHead: '',
    selectedMembers: []
  });

  const [submitting, setSubmitting] = useState(false);
  const [showRegisterMember, setShowRegisterMember] = useState(false);

  // Registration Form State for New Member
  const [regForm, setRegForm] = useState({
    name: '', phone: '', email: '', aadhaar: '', pan: '',
    dob: '', gender: '', occupation: '', income: '',
    address: { street: '', city: '', state: '', pincode: '' },
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoadingClients(true);
      try {
        const [clientsRes, usersRes] = await Promise.all([
          api.get('/clients', { params: { limit: 1000 } }),
          api.get('/users')
        ]);
        setClients(clientsRes.data.data);
        setStaff(usersRes.data.data.filter(u => u.role === 'staff' || u.role === 'admin'));
      } catch {
        toast.error('Failed to load initial data.');
      } finally {
        setLoadingClients(false);
      }
    };
    fetchData();
  }, []);

  // Auto-generate Center Code
  useEffect(() => {
    if (formData.centerNumber && formData.village) {
      const vPart = formData.village.substring(0, 3).toUpperCase();
      const code = `CTR-${formData.centerNumber}-${vPart}`;
      setFormData(prev => ({ ...prev, centerCode: code }));
    }
  }, [formData.centerNumber, formData.village]);

  const handleChange = (e) => {
    const { name, value, options, type } = e.target;
    if (name === 'selectedMembers') {
      const selected = Array.from(options).filter(opt => opt.selected).map(opt => opt.value);
      if (selected.length > 10) {
        return toast.error('A group cannot have more than 10 members');
      }
      setFormData(prev => ({ ...prev, selectedMembers: selected }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.aadhaar.includes(searchTerm)
  );

  const handleRegisterMember = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...regForm, income: regForm.income ? Number(regForm.income) : undefined };
      const res = await api.post('/clients', payload);
      const newClient = res.data.data;

      // Add to local clients list and select as head
      setClients(prev => [newClient, ...prev]);
      setFormData(prev => ({ ...prev, groupHead: newClient._id }));

      toast.success('Client registered and selected as Head');
      setShowRegisterMember(false);
      // Reset form
      setRegForm({
        name: '', phone: '', email: '', aadhaar: '', pan: '',
        dob: '', gender: '', occupation: '', income: '',
        address: { street: '', city: '', state: '', pincode: '' },
        notes: '',
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register member');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = ['groupName', 'centerNumber', 'centerName', 'village', 'groupHead'];
    for (const f of required) {
      if (!formData[f]) return toast.error(`Missing required field: ${f}`);
    }

    if (formData.selectedMembers.length > 10) {
      return toast.error('Maximum 10 members allowed');
    }

    setSubmitting(true);
    try {
      const res = await api.post('/groups', {
        ...formData,
        members: formData.selectedMembers
      });
      toast.success('Group created successfully!');
      navigate(`/groups`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create group');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-enter" style={{ maxWidth: 900, margin: '0 auto' }}>
      <button className="btn btn-secondary btn-icon" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Create New Group</h2>
            <p className="text-sm text-muted">Add a new lending group with advanced operational metadata.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 25 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30 }}>
            {/* Left Column: Core Info */}
            <div className="space-y-6">
              <h4 className="section-title"><Users size={16} /> Basic Information</h4>

              <div className="form-group">
                <label className="form-label">Group Name <span className="form-required" /></label>
                <div className="input-group">
                  <span className="input-group-icon"><Users size={16} /></span>
                  <input className="form-control" required name="groupName" value={formData.groupName} onChange={handleChange} placeholder="e.g. Mahila Samiti Alpha" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Center Number <span className="form-required" /></label>
                  <input className="form-control" required name="centerNumber" value={formData.centerNumber} onChange={handleChange} placeholder="e.g. 101" />
                </div>
                <div className="form-group">
                  <label className="form-label">Center Name <span className="form-required" /></label>
                  <input className="form-control" required name="centerName" value={formData.centerName} onChange={handleChange} placeholder="e.g. North Zone" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Village <span className="form-required" /></label>
                <input className="form-control" required name="village" value={formData.village} onChange={handleChange} placeholder="e.g. Rampur" />
              </div>

              <div className="form-group">
                <label className="form-label">Center Code (Manual or Auto-generated)</label>
                <input className="form-control" name="centerCode" value={formData.centerCode} onChange={handleChange} placeholder="e.g. CTR-101-RAM" />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Leave blank to auto-generate based on Center Number and Village.</div>
              </div>
            </div>

            {/* Right Column: Operational Metadata */}
            <div className="space-y-6">
              <h4 className="section-title"><Calendar size={16} /> Operational Settings</h4>

              <div className="form-group">
                <label className="form-label">Meeting Day</label>
                <div className="input-group">
                  <span className="input-group-icon"><Calendar size={16} /></span>
                  <select className="form-control" name="meetingDay" value={formData.meetingDay} onChange={handleChange}>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Collection Agent</label>
                <div className="input-group">
                  <span className="input-group-icon"><UserCheck size={16} /></span>
                  <select className="form-control" name="collectionAgent" value={formData.collectionAgent} onChange={handleChange}>
                    <option value="">-- Assign Agent --</option>
                    {staff.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Risk Category</label>
                  <div className="input-group">
                    <span className="input-group-icon"><ShieldAlert size={16} /></span>
                    <select className="form-control" name="riskCategory" value={formData.riskCategory} onChange={handleChange}>
                      <option value="low">🟢 Low</option>
                      <option value="moderate">🟡 Moderate</option>
                      <option value="high">🔴 High</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Status</label>
                  <div className="input-group">
                    <span className="input-group-icon"><Activity size={16} /></span>
                    <select className="form-control" name="status" value={formData.status} onChange={handleChange}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="divider" style={{ margin: '30px 0' }} />

          {/* Member Selection */}
          <div className="space-y-4">
            <h4 className="section-title"><Users size={16} /> Members Allocation</h4>

            <div className="grid grid-cols-2 gap-6">
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Group Head <span className="form-required" /></label>
                  <button type="button" className="btn btn-ghost btn-sm text-primary" onClick={() => setShowRegisterMember(true)} style={{ padding: '0 4px', height: 'auto', fontSize: 12 }}>
                    <Plus size={12} className="mr-1" /> Register New
                  </button>
                </div>
                <select className="form-control" name="groupHead" value={formData.groupHead} onChange={handleChange} required disabled={loadingClients}>
                  <option value="">-- Select Group Head --</option>
                  {clients.map(c => <option key={c._id} value={c._id}>{c.name} ({c.aadhaar})</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Search Members</label>
                <div className="input-group">
                  <span className="input-group-icon"><Search size={16} /></span>
                  <input className="form-control" placeholder="Search clients..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Select Group Members (Max 10)</label>
              <select
                multiple
                name="selectedMembers"
                className="form-control"
                value={formData.selectedMembers}
                onChange={handleChange}
                disabled={loadingClients}
                style={{ minHeight: '180px' }}
              >
                {filteredClients.map(c => (
                  <option key={c._id} value={c._id} style={{ background: 'var(--bg-card)', color: 'var(--text)', padding: '4px 8px' }}>
                    {c.name} — {c.aadhaar} {formData.selectedMembers.includes(c._id) ? '✓' : ''}
                  </option>
                ))}
              </select>
              <div className="flex justify-between items-center mt-2">
                <div className="text-xs text-muted">Hold Ctrl/Cmd to select multiple. Group Head is automatically added on save.</div>
                <div className={`text-xs font-bold ${formData.selectedMembers.length > 10 ? 'text-danger' : 'text-primary'}`}>
                  Selected: {formData.selectedMembers.length} / 10
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 15, marginTop: 30, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting || formData.selectedMembers.length > 10}>
              <Save size={16} /> {submitting ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
      {/* Register New Member Modal */}
      {showRegisterMember && (
        <div className="modal-overlay">
          <div className="card" style={{ width: 800, padding: 0, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header" style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1, borderBottom: '1px solid var(--border)' }}>
              <h3 className="card-title">Register New Client</h3>
              <button type="button" className="btn btn-icon" onClick={() => setShowRegisterMember(false)} style={{ marginLeft: 'auto' }}><X size={20} /></button>
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
                <button type="submit" className="btn btn-primary">Register Client</button>
              </div>
            </form>
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
      `}</style>
    </div>
  );
}
