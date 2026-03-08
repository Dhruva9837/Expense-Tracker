import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import { SkeletonTable } from '../components/Skeleton';
import {
  DollarSign, CheckCircle2, Calendar, Filter, Wallet, Clock,
  RefreshCw, Users, BookOpen, ChevronDown, ChevronRight, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const METHOD_ICONS = { cash: '💵', upi: '📱', online: '🏦', cheque: '📄' };
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/* ── Inline Kist Form (appears per loan row) ─────────────────────── */
function KistForm({ loan, onClose, onSuccess }) {
  const pendingEMIs = (loan.schedule || []).filter(
    e => ['pending', 'overdue', 'partial'].includes(e.status)
  );
  const nextEMI = pendingEMIs[0];

  const [form, setForm] = useState({
    amount: loan.emiAmount || '',
    paymentMethod: 'cash',
    installmentNo: nextEMI?.installmentNo || '',
    notes: '',
    paidAt: new Date().toISOString().split('T')[0],
  });

  const mutation = useMutation({
    mutationFn: (payload) => api.post('/payments', payload),
    onSuccess: () => {
      toast.success(`✅ Kist recorded for ${loan.groupId?.groupName}`);
      onSuccess();
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to record kist'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) return toast.error('Enter valid amount');
    mutation.mutate({
      loanId: loan._id,
      amount: Number(form.amount),
      paymentMethod: form.paymentMethod,
      installmentNo: form.installmentNo ? Number(form.installmentNo) : undefined,
      notes: form.notes,
      paidAt: form.paidAt,
    });
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(99,102,241,0.04), rgba(16,185,129,0.03))',
      border: '1px solid var(--primary)',
      borderRadius: 12,
      padding: '16px 18px',
      marginTop: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>
          📋 Kist Record — {loan.groupId?.groupName}
        </div>
        <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18 }}>×</button>
      </div>

      {nextEMI && (
        <div style={{ fontSize: 12, color: 'var(--warning)', background: 'rgba(245,158,11,0.08)', padding: '6px 10px', borderRadius: 6, marginBottom: 12 }}>
          ⚠️ Next due: Kist #{nextEMI.installmentNo} on {formatDate(nextEMI.dueDate)} — {formatCurrency(nextEMI.emi - nextEMI.paidAmount)}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Kist No. (Installment)</label>
            <select className="form-control" value={form.installmentNo} onChange={e => setForm({ ...form, installmentNo: e.target.value })}>
              <option value="">Auto (next pending)</option>
              {pendingEMIs.map(e => (
                <option key={e.installmentNo} value={e.installmentNo}>
                  #{e.installmentNo} — {formatDate(e.dueDate)} — {formatCurrency(e.emi)} {e.status !== 'pending' ? `(${e.status})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Amount (₹) *</label>
            <input
              className="form-control"
              type="number"
              required
              min="1"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              placeholder={loan.emiAmount}
            />
          </div>
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select className="form-control" value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>
              <option value="cash">💵 Cash</option>
              <option value="upi">📱 UPI</option>
              <option value="online">🏦 Online</option>
              <option value="cheque">📄 Cheque</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Collection Date</label>
            <input
              className="form-control"
              type="date"
              value={form.paidAt}
              onChange={e => setForm({ ...form, paidAt: e.target.value })}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Notes (optional)</label>
          <input
            className="form-control"
            type="text"
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            placeholder="e.g. Partial, late fee, etc."
          />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={mutation.isPending}>
            {mutation.isPending ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <><CheckCircle2 size={14} /> Save Kist</>}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Loan Row with expandable schedule + inline kist form ────────── */
function LoanRow({ loan, onKistSaved }) {
  const [expanded, setExpanded] = useState(false);
  const [showKistForm, setShowKistForm] = useState(false);

  const pendingCount = (loan.schedule || []).filter(e => ['pending', 'overdue', 'partial'].includes(e.status)).length;
  const paidCount = (loan.schedule || []).filter(e => e.status === 'paid').length;
  const hasOverdue = (loan.schedule || []).some(e => e.status === 'overdue');

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: 10,
      marginBottom: 10,
      overflow: 'hidden',
      borderLeft: `3px solid ${hasOverdue ? 'var(--danger)' : 'var(--primary)'}`,
    }}>
      {/* Loan summary row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-card)', cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        <div style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>
            {loan.groupId?.groupName}
            {hasOverdue && <span style={{ marginLeft: 6, color: 'var(--danger)', fontSize: 11 }}>⚠ Overdue</span>}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {loan.loanNumber} · {loan.emiFrequency} · Center: {loan.groupId?.centerNumber}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary)' }}>{formatCurrency(loan.emiAmount)}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>per kist</div>
        </div>
        <div style={{ textAlign: 'center', minWidth: 70 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)' }}>{paidCount} paid</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{pendingCount} left</div>
        </div>
        <div style={{ fontWeight: 600, fontSize: 13, color: loan.outstandingBalance > 0 ? 'var(--warning)' : 'var(--success)' }}>
          {formatCurrency(loan.outstandingBalance)}
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          style={{ flexShrink: 0 }}
          onClick={e => {
            e.stopPropagation();
            setShowKistForm(!showKistForm);
            setExpanded(true);
          }}
        >
          <DollarSign size={13} /> Kist Likho
        </button>
      </div>

      {/* Expanded section: schedule + form */}
      {expanded && (
        <div style={{ padding: '0 16px 14px', background: 'var(--bg)' }}>
          {showKistForm && (
            <KistForm
              loan={loan}
              onClose={() => setShowKistForm(false)}
              onSuccess={onKistSaved}
            />
          )}

          {/* Schedule table */}
          <div style={{ marginTop: 12, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-card)' }}>
                  <th style={{ padding: '7px 10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>#</th>
                  <th style={{ padding: '7px 10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Due Date</th>
                  <th style={{ padding: '7px 10px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600 }}>Kist (₹)</th>
                  <th style={{ padding: '7px 10px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600 }}>Paid (₹)</th>
                  <th style={{ padding: '7px 10px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {(loan.schedule || []).map((emi) => (
                  <tr key={emi.installmentNo} style={{
                    borderTop: '1px solid var(--border)',
                    background: emi.status === 'overdue' ? 'rgba(239,68,68,0.04)'
                      : emi.status === 'paid' ? 'rgba(16,185,129,0.03)'
                        : undefined,
                  }}>
                    <td style={{ padding: '6px 10px', fontWeight: 600, color: 'var(--text-muted)' }}>{emi.installmentNo}</td>
                    <td style={{ padding: '6px 10px' }}>{formatDate(emi.dueDate)}</td>
                    <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(emi.emi)}</td>
                    <td style={{ padding: '6px 10px', textAlign: 'right', color: emi.paidAmount > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                      {emi.paidAmount > 0 ? formatCurrency(emi.paidAmount) : '—'}
                    </td>
                    <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                      <StatusBadge status={emi.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Collections Page ───────────────────────────────────────── */
export default function Collections() {
  const queryClient = useQueryClient();
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMeetingDay, setSelectedMeetingDay] = useState(DAYS[new Date().getDay()]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const [activeTab, setActiveTab] = useState('kist'); // 'kist' | 'history'

  /* ---- Queries ---- */
  const { data: groupsData, isLoading: loadingGroups } = useQuery({
    queryKey: ['groups-collection', selectedMeetingDay],
    queryFn: async () => {
      const res = await api.get('/groups', { params: { meetingDay: selectedMeetingDay, status: 'active', limit: 1000 } });
      return res.data.data;
    }
  });

  const { data: loansData, isLoading: loadingLoans, refetch: refetchLoans } = useQuery({
    queryKey: ['loans-kist', selectedMeetingDay, selectedGroupId],
    queryFn: async () => {
      const params = { status: 'active', meetingDay: selectedMeetingDay, limit: 100 };
      if (selectedGroupId) params.groupId = selectedGroupId;
      const res = await api.get('/loans', { params });
      // Fetch full schedule for each loan
      const detailed = await Promise.all(
        res.data.data.map(l => api.get(`/loans/${l._id}`).then(r => r.data.data).catch(() => l))
      );
      return detailed;
    },
    staleTime: 0,
  });

  const { data: paymentsData, isLoading: loadingPayments, refetch: refetchPayments } = useQuery({
    queryKey: ['payments-kist', filterDate, historyPage, selectedGroupId],
    queryFn: async () => {
      const params = { page: historyPage, limit: 20, from: filterDate, to: filterDate };
      if (selectedGroupId) params.groupId = selectedGroupId;
      const res = await api.get('/payments', { params });
      return res.data;
    }
  });

  const loans = loansData || [];
  const groups = groupsData || [];
  const payments = paymentsData?.data || [];
  const pagination = paymentsData?.pagination || { page: 1, pages: 1, total: 0 };

  /* ---- Live metrics ---- */
  const metrics = useMemo(() => {
    const collected = payments.reduce((s, p) => s + p.amount, 0);
    const totalEMI = loans.reduce((s, l) => s + (l.emiAmount || 0), 0);
    const overdueLoans = loans.filter(l => (l.schedule || []).some(e => e.status === 'overdue')).length;
    return { collected, totalEMI, overdueLoans, loanCount: loans.length };
  }, [payments, loans]);

  const handleKistSaved = () => {
    refetchLoans();
    refetchPayments();
    queryClient.invalidateQueries(['dashboard', 'kpi']);
  };

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Kist Collection Register (किस्त रजिस्टर)</div>
          <div className="page-subtitle">Record installments manually · {selectedMeetingDay} groups · {filterDate}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary btn-icon" onClick={() => { refetchLoans(); refetchPayments(); }} title="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Live KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Active Loans', val: metrics.loanCount, icon: BookOpen, color: '#6366f1' },
          { label: 'Total EMI Due', val: formatCurrency(metrics.totalEMI), icon: Calendar, color: '#0ea5e9' },
          { label: 'Collected Today', val: formatCurrency(metrics.collected), icon: Wallet, color: '#10b981' },
          { label: 'Overdue Loans', val: metrics.overdueLoans, icon: AlertCircle, color: '#ef4444' },
        ].map(({ label, val, icon: Icon, color }) => (
          <div key={label} className="card card-body" style={{ display: 'flex', alignItems: 'center', gap: 12, borderLeft: `3px solid ${color}` }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>{val}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20 }}>
        {/* ---- Left: Filters ---- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card card-body">
            <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Filter size={14} /> Filters
            </h4>
            <div className="form-group">
              <label className="form-label">Meeting Day</label>
              <select className="form-control" value={selectedMeetingDay} onChange={(e) => { setSelectedMeetingDay(e.target.value); setSelectedGroupId(''); }}>
                {DAYS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Center / Group</label>
              <select className="form-control" value={selectedGroupId} onChange={(e) => setSelectedGroupId(e.target.value)} disabled={loadingGroups}>
                <option value="">— All ({groups.length}) —</option>
                {groups.map(g => (
                  <option key={g._id} value={g._id}>{g.centerNumber} | {g.groupName}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Collection Date</label>
              <input type="date" className="form-control" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
            </div>
          </div>

          {/* Quick stats per selected group */}
          {selectedGroupId && (
            <div className="card card-body" style={{ fontSize: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>📊 Group Summary</div>
              {loans.map(l => (
                <div key={l._id} style={{ marginBottom: 8, padding: '8px', background: 'var(--bg)', borderRadius: 6 }}>
                  <div style={{ fontWeight: 600 }}>{l.loanNumber}</div>
                  <div style={{ color: 'var(--text-muted)' }}>Balance: {formatCurrency(l.outstandingBalance)}</div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    EMI: {formatCurrency(l.emiAmount)} · {l.emiFrequency}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ---- Right: Tabs ---- */}
        <div>
          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {[
              { id: 'kist', label: '📝 Kist Record (किस्त लिखो)' },
              { id: 'history', label: '📜 Payment History' },
            ].map(t => (
              <button
                key={t.id}
                className={`btn btn-sm ${activeTab === t.id ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === 'kist' ? (
            <div>
              {loadingLoans ? (
                <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner spinner-dark" style={{ width: 32, height: 32, margin: 'auto' }} /></div>
              ) : loans.length === 0 ? (
                <div className="empty-state card card-body">
                  <div className="empty-state-icon"><Users size={36} /></div>
                  <h3>No active loans today</h3>
                  <p>No {selectedMeetingDay} groups found. Try changing the meeting day filter.</p>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                    Showing {loans.length} active loan{loans.length !== 1 ? 's' : ''} — click <strong>Kist Likho</strong> to record a payment
                  </div>
                  {loans.map(loan => (
                    <LoanRow key={loan._id} loan={loan} onKistSaved={handleKistSaved} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">किस्त Records — {filterDate}</h3>
                <span className="badge badge-info ml-auto">{pagination.total} entries</span>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Group / Loan</th>
                      <th>Kist #</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Collected By</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingPayments ? (
                      <tr><td colSpan={6}><SkeletonTable rows={8} cols={6} /></td></tr>
                    ) : payments.length === 0 ? (
                      <tr>
                        <td colSpan={6}>
                          <div className="empty-state">
                            <div className="empty-state-icon">🧾</div>
                            <h3>No kist records for {filterDate}</h3>
                            <p>Switch to the "Kist Record" tab to record payments.</p>
                          </div>
                        </td>
                      </tr>
                    ) : payments.map((p) => (
                      <tr key={p._id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{p.groupId?.groupName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.loanId?.loanNumber}</div>
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {p.installmentNo ? `#${p.installmentNo}` : '—'}
                        </td>
                        <td style={{ fontWeight: 800, color: 'var(--success)' }}>{formatCurrency(p.amount)}</td>
                        <td>
                          <span className="badge badge-secondary">
                            {METHOD_ICONS[p.paymentMethod] || '💳'} {p.paymentMethod?.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ fontSize: 12 }}>{p.collectedBy?.name || '—'}</td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDateTime(p.paidAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="card-footer">
                <Pagination page={pagination.page} pages={pagination.pages} onPageChange={setHistoryPage} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
