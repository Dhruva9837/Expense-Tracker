import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { formatCurrency, formatDate } from '../utils/formatters';
import StatusBadge from '../components/StatusBadge';
import { ArrowLeft, Phone, Mail, MapPin, CreditCard, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get(`/clients/${id}`), api.get(`/clients/${id}/loans`)])
      .then(([cr, lr]) => { setClient(cr.data.data); setLoans(lr.data.data); })
      .catch(() => toast.error('Failed to load client'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner spinner-dark" style={{ width: 36, height: 36, margin: 'auto' }} /></div>;
  if (!client) return <div className="empty-state"><div>Client not found</div></div>;

  const activeLoans = loans.filter((l) => l.status === 'active');

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="btn btn-secondary btn-sm" style={{ marginBottom: 8 }} onClick={() => navigate('/clients')}><ArrowLeft size={14} /> Back</button>
          <div className="page-title">{client.name}</div>
          <div className="page-subtitle">Client Profile</div>
        </div>
        {activeLoans.length === 0 && (
          <button className="btn btn-primary" onClick={() => navigate(`/loans/new?clientId=${id}&clientName=${encodeURIComponent(client.name)}`)}>
            <Plus size={16} /> New Loan
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 20 }}>
        {/* Profile Card */}
        <div>
          <div className="card card-body" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 22 }}>
                {client.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{client.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Joined {formatDate(client.createdAt)}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {client.phone && <div className="flex items-center gap-2 text-sm"><Phone size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />{client.phone}</div>}
              {client.email && <div className="flex items-center gap-2 text-sm"><Mail size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />{client.email}</div>}
              {(client.address?.city || client.address?.state) && (
                <div className="flex items-center gap-2 text-sm"><MapPin size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />{[client.address?.city, client.address?.state].filter(Boolean).join(', ')}</div>
              )}
            </div>
          </div>

          <div className="card card-body">
            <h4 style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>KYC Details</h4>
            <table style={{ width: '100%', fontSize: 13 }}>
              <tbody>
                {[
                  ['Aadhaar', client.aadhaar],
                  ['PAN', client.pan || '—'],
                  ['DOB', formatDate(client.dob)],
                  ['Gender', client.gender || '—'],
                  ['Occupation', client.occupation || '—'],
                  ['Monthly Income', client.income ? formatCurrency(client.income) : '—'],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ padding: '6px 0', color: 'var(--text-muted)', width: '45%' }}>{k}</td>
                    <td style={{ padding: '6px 0', fontWeight: 500 }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Loans */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontWeight: 600 }}>Loan History</span>
            <span className="chip"><CreditCard size={12} />{loans.length} loans</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Loan No</th><th>Principal</th><th>EMI</th><th>Status</th><th>Disbursed</th><th></th></tr>
              </thead>
              <tbody>
                {loans.length === 0 ? (
                  <tr><td colSpan={6}><div className="empty-state" style={{ padding: 30 }}><div>No loans yet</div></div></td></tr>
                ) : loans.map((l) => (
                  <tr key={l._id}>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{l.loanNumber}</td>
                    <td>{formatCurrency(l.principal)}</td>
                    <td>{formatCurrency(l.emiAmount)}/mo</td>
                    <td><StatusBadge status={l.status} /></td>
                    <td className="text-sm text-muted">{formatDate(l.disbursedAt)}</td>
                    <td>
                      <Link to={`/loans/${l._id}`} className="btn btn-sm btn-secondary">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
