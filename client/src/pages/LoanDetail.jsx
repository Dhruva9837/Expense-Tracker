import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';
import StatusBadge from '../components/StatusBadge';
import { ArrowLeft, DollarSign, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function LoanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isViewer } = useAuth();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('schedule');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('cash');
  const [paying, setPaying] = useState(false);

  const fetchLoan = () => {
    setLoading(true);
    api.get(`/loans/${id}`).then((r) => setLoan(r.data.data)).catch(() => toast.error('Loan not found')).finally(() => setLoading(false));
  };

  useEffect(fetchLoan, [id]);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) return toast.error('Enter valid amount');
    setPaying(true);
    try {
      await api.post('/payments', { loanId: id, amount: Number(payAmount), paymentMethod: payMethod });
      toast.success('Payment recorded!');
      setPayAmount('');
      fetchLoan();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally { setPaying(false); }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner spinner-dark" style={{ width: 36, height: 36, margin: 'auto' }} /></div>;
  if (!loan) return <div className="empty-state">Loan not found</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="btn btn-secondary btn-sm" style={{ marginBottom: 8 }} onClick={() => navigate('/loans')}><ArrowLeft size={14} /> Back</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="page-title">{loan.loanNumber}</div>
            <StatusBadge status={loan.status} />
          </div>
          <Link to={`/groups/${loan.groupId?._id}`} className="page-subtitle" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
            {loan.groupId?.groupName} — {loan.groupId?.center}
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        {/* Main Panel */}
        <div>
          {/* Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Principal', val: formatCurrency(loan.principal) },
              { label: 'EMI Amount', val: formatCurrency(loan.emiAmount) },
              { label: 'Outstanding', val: formatCurrency(loan.outstandingBalance) },
              { label: 'Frequency / Tenure', val: `${loan.emiFrequency} / ${loan.emiFrequency === 'Weekly' ? loan.tenure + 'wk' : loan.tenure + 'mo'}` },
            ].map(({ label, val }) => (
              <div key={label} className="card card-body" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{val}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
            {['schedule', 'timeline'].map((t) => (
              <button key={t} className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab(t)}>
                {t === 'schedule' ? '📅 Schedule' : '📋 Timeline'}
              </button>
            ))}
          </div>

          <div className="card">
            {tab === 'schedule' ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>#</th><th>Due Date</th><th>Principal</th><th>EMI</th><th>Balance</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {loan.schedule?.map((emi) => (
                      <tr key={emi.installmentNo} style={{ background: emi.status === 'overdue' ? 'rgba(239,68,68,0.04)' : undefined }}>
                        <td style={{ fontWeight: 600 }}>{emi.installmentNo}</td>
                        <td className="text-sm">{formatDate(emi.dueDate)}</td>
                        <td>{formatCurrency(emi.principal)}</td>
                        <td style={{ fontWeight: 600 }}>{formatCurrency(emi.emi)}</td>
                        <td className="text-sm">{formatCurrency(emi.balance)}</td>
                        <td><StatusBadge status={emi.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="card-body">
                <div className="timeline">
                  {loan.activityTimeline?.slice().reverse().map((act, idx) => (
                    <div key={idx} className="timeline-item">
                      <div className="timeline-dot" />
                      <div className="timeline-content">
                        <div className="timeline-action">{act.action?.replace(/_/g, ' ')}</div>
                        <div className="timeline-meta">{act.description}</div>
                        <div className="text-xs text-muted" style={{ marginTop: 2 }}>{formatDateTime(act.performedAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Sidebar */}
        <div>
          {loan.status === 'active' && !isViewer() && (
            <div className="card card-body" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <DollarSign size={18} color="var(--success)" />
                <h3 style={{ fontWeight: 700, fontSize: 15 }}>Collect Payment</h3>
              </div>
              <form onSubmit={handlePay}>
                <div className="form-group">
                  <label className="form-label">Amount (₹)</label>
                  <input className="form-control" type="number" min="1" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder={formatCurrency(loan.emiAmount)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select className="form-control" value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="online">Online Transfer</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-success w-full" disabled={paying} style={{ justifyContent: 'center' }}>
                  {paying ? <div className="spinner" /> : 'Record Payment'}
                </button>
              </form>
            </div>
          )}

          <div className="card card-body">
            <h4 style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Loan Summary</h4>
            {[
              ['Disbursed', formatDate(loan.disbursedAt)],
              ['Maturity', formatDate(loan.maturityDate)],
              ['Total Amount', formatCurrency(loan.totalAmount)],
              ['Prepaid', formatCurrency(loan.prepaidAmount)],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <span className="text-muted">{k}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
