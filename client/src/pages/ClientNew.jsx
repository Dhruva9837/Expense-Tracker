import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, UserPlus, User, MapPin, FileText } from 'lucide-react';

export default function ClientNew() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', aadhaar: '', pan: '',
    dob: '', gender: '', occupation: '', income: '',
    address: { street: '', city: '', state: '', pincode: '' },
    notes: '',
    groupId: '',
  });

  const [groups, setGroups] = useState([]);

  useEffect(() => {
    api.get('/groups', { params: { limit: 1000, status: 'active' } })
      .then(res => setGroups(res.data.data))
      .catch(() => toast.error('Failed to load groups'));
  }, []);

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));
  const setAddr = (field, val) => setForm((f) => ({ ...f, address: { ...f.address, [field]: val } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, income: form.income ? Number(form.income) : undefined };
      await api.post('/clients', payload);
      toast.success('Client created successfully');
      navigate('/clients');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <button className="btn btn-secondary btn-sm" style={{ marginBottom: 10 }} onClick={() => navigate('/clients')}>
            <ArrowLeft size={13} /> Back to Clients
          </button>
          <div className="page-title">New Client</div>
          <div className="page-subtitle">Register a borrower in the system</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Personal Info */}
          <div className="card card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={16} color="var(--primary)" /></div>
              <h3 style={{ fontWeight: 700, fontSize: 15 }}>Personal Information</h3>
            </div>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-control" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ravi Kumar" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input className="form-control" required value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="9876543210" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-control" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="ravi@email.com" />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Aadhaar Number *</label>
                <input className="form-control" required maxLength={12} value={form.aadhaar} onChange={(e) => set('aadhaar', e.target.value.replace(/\D/g, ''))} placeholder="XXXX XXXX XXXX" />
              </div>
              <div className="form-group">
                <label className="form-label">PAN Number</label>
                <input className="form-control" maxLength={10} value={form.pan} onChange={(e) => set('pan', e.target.value.toUpperCase())} placeholder="ABCDE1234F" />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input className="form-control" type="date" value={form.dob} onChange={(e) => set('dob', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-control" value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Occupation</label>
                <input className="form-control" value={form.occupation} onChange={(e) => set('occupation', e.target.value)} placeholder="Farmer, Business..." />
              </div>
              <div className="form-group">
                <label className="form-label">Assigned Group / Center</label>
                <select className="form-control" value={form.groupId} onChange={(e) => set('groupId', e.target.value)}>
                  <option value="">No Group (Individual)</option>
                  {groups.map(g => (
                    <option key={g._id} value={g._id}>{g.centerNumber} | {g.groupName}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Monthly Income (₹)</label>
              <input className="form-control" type="number" value={form.income} onChange={(e) => set('income', e.target.value)} placeholder="25000" />
            </div>
          </div>

          {/* Address */}
          <div>
            <div className="card card-body" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(14,165,233,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin size={16} color="var(--accent)" /></div>
                <h3 style={{ fontWeight: 700, fontSize: 15 }}>Address Details</h3>
              </div>
              <div className="form-group">
                <label className="form-label">Street</label>
                <input className="form-control" value={form.address.street} onChange={(e) => setAddr('street', e.target.value)} placeholder="123 Main Road" />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-control" value={form.address.city} onChange={(e) => setAddr('city', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input className="form-control" value={form.address.state} onChange={(e) => setAddr('state', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input className="form-control" maxLength={6} value={form.address.pincode} onChange={(e) => setAddr('pincode', e.target.value.replace(/\D/g, ''))} />
              </div>
            </div>
            <div className="card card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={16} color="var(--success)" /></div>
                <h3 style={{ fontWeight: 700, fontSize: 15 }}>Notes</h3>
              </div>
              <textarea className="form-control" rows={4} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Additional remarks, references, or notes…" />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
          <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate('/clients')}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? <div className="spinner" /> : <><UserPlus size={16} /> Create Client</>}
          </button>
        </div>
      </form>
    </div>
  );
}
