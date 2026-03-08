import { useState } from 'react';
import api from '../api/axios';
import { formatCurrency, formatDateTime, formatDate } from '../utils/formatters';
import { BarChart2, Download, FileText, AlertTriangle, TrendingUp, Calendar, RefreshCw, Users, UserCheck, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import StatusBadge from '../components/StatusBadge';

const REPORT_TYPES = [
  { key: 'daily', label: 'Daily Collection', icon: Calendar },
  { key: 'loans', label: 'Loan Report', icon: TrendingUp },
  { key: 'overdue', label: 'Overdue Loans', icon: AlertTriangle },
  { key: 'field-officer', label: 'Officer Collection', icon: UserCheck },
  { key: 'center-performance', label: 'Center Performance', icon: Users },
  { key: 'clients', label: 'Client Report', icon: FileText },
];

export default function Reports() {
  const [activeReport, setActiveReport] = useState('daily');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [status, setStatus] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    setData(null);
    try {
      const params = {};
      if (activeReport === 'daily') params.date = date;
      if (activeReport === 'loans' && status) params.status = status;
      if (from) params.from = from;
      if (to) params.to = to;
      const res = await api.get(`/reports/${activeReport}`, { params });
      setData(res.data.data);
    } catch { toast.error('Failed to generate report'); }
    finally { setLoading(false); }
  };

  const downloadPDF = () => {
    const params = new URLSearchParams({ date });
    window.open(`/api/reports/daily/pdf?${params}`, '_blank');
  };
  const downloadExcel = () => {
    const params = new URLSearchParams({ date });
    window.open(`/api/reports/daily/excel?${params}`, '_blank');
  };
  const downloadCSV = () => {
    const params = new URLSearchParams({ date });
    window.open(`/api/reports/daily/csv?${params}`, '_blank');
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <div className="page-title">Reports & Analytics</div>
          <div className="page-subtitle">Generate and export operational reports</div>
        </div>
        {activeReport === 'daily' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={downloadPDF}><Download size={13} /> PDF</button>
            <button className="btn btn-secondary btn-sm" onClick={downloadExcel}><Download size={13} /> Excel</button>
            <button className="btn btn-secondary btn-sm" onClick={downloadCSV}><Download size={13} /> CSV</button>
          </div>
        )}
      </div>

      {/* Report type selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        {REPORT_TYPES.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setActiveReport(key); setData(null); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              borderRadius: 'var(--radius)',
              border: `2px solid ${activeReport === key ? 'var(--primary)' : 'var(--border)'}`,
              background: activeReport === key ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-card)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: activeReport === key ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={16} color={activeReport === key ? 'var(--primary)' : 'var(--text-muted)'} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: activeReport === key ? 'var(--primary)' : 'var(--text)' }}>
              {label}
            </div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="card card-body" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {activeReport === 'daily' ? (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Report Date</label>
              <input type="date" className="form-control" style={{ width: 200 }} value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          ) : (
            <>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">From Date</label>
                <input type="date" className="form-control" style={{ width: 180 }} value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">To Date</label>
                <input type="date" className="form-control" style={{ width: 180 }} value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
              {activeReport === 'loans' && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Status</label>
                  <select className="form-control" style={{ width: 150 }} value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                    <option value="defaulted">Defaulted</option>
                  </select>
                </div>
              )}
            </>
          )}
          <button className="btn btn-primary" onClick={fetchReport} disabled={loading} style={{ height: 42 }}>
            {loading ? <div className="spinner" /> : <><BarChart2 size={14} /> Generate Report</>}
          </button>
          {data && (
            <button className="btn btn-secondary" onClick={() => setData(null)} style={{ height: 42 }}>
              <RefreshCw size={14} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {data && (
        <div className="card">
          {activeReport === 'daily' && (
            <>
              <div className="card-header">
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Daily Collection Report</div>
                  <div className="text-sm text-muted">{date}</div>
                </div>
                <div style={{ fontWeight: 800, color: 'var(--success)', fontSize: 20 }}>{formatCurrency(data.total)}</div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Client</th><th>Loan No</th><th>Amount</th><th>Method</th><th>Time</th></tr></thead>
                  <tbody>
                    {data.payments?.length === 0 && (
                      <tr><td colSpan={5}><div className="empty-state" style={{ padding: 30 }}>No collections for this date</div></td></tr>
                    )}
                    {data.payments?.map((p) => (
                      <tr key={p._id}>
                        <td style={{ fontWeight: 600 }}>{p.clientId?.name}</td>
                        <td className="table-cell-primary">{p.loanId?.loanNumber}</td>
                        <td style={{ fontWeight: 700, color: 'var(--success)' }}>{formatCurrency(p.amount)}</td>
                        <td><span className="chip" style={{ fontSize: 11 }}>{p.paymentMethod}</span></td>
                        <td className="text-sm text-muted">{formatDateTime(p.paidAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeReport === 'loans' && (
            <>
              <div className="card-header">
                <div style={{ fontWeight: 700, fontSize: 15 }}>Comprehensive Loan Report</div>
                <span className="chip">{data.length} loans found</span>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Loan No</th>
                      <th>Group & Center</th>
                      <th>Principal</th>
                      <th>Outstanding</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item) => (
                      <tr key={item._id}>
                        <td className="table-cell-primary" style={{ fontWeight: 700 }}>{item.loanNumber}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{item.group}</div>
                          <div className="text-xs text-muted">{item.center} | {item.village}</div>
                        </td>
                        <td style={{ fontWeight: 600 }}>{formatCurrency(item.principal)}</td>
                        <td style={{ fontWeight: 700, color: item.outstanding > 0 ? 'var(--warning)' : 'var(--success)' }}>
                          {formatCurrency(item.outstanding)}
                        </td>
                        <td><StatusBadge status={item.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeReport === 'overdue' && (
            <>
              <div className="card-header">
                <div style={{ fontWeight: 700, fontSize: 15 }}>Overdue Loans Tracking</div>
                <span className="badge badge-overdue">{data.length} overdue</span>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Client</th><th>Group & Risk</th><th>Overdue EMIs</th><th>Overdue Amount</th><th>Penalty</th></tr></thead>
                  <tbody>
                    {data.length === 0 && <tr><td colSpan={5}><div className="empty-state" style={{ padding: 30 }}>✅ No overdue loans!</div></td></tr>}
                    {data.map((item, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>
                          <div>{item.loan?.clientId?.name}</div>
                          <div className="text-xs font-mono">{item.loan?.loanNumber}</div>
                        </td>
                        <td>
                          <div className="text-sm font-bold">{item.group}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <ShieldAlert size={12} className={item.risk === 'high' ? 'text-danger' : 'text-warning'} />
                            <span className={`text-xs font-bold uppercase ${item.risk === 'high' ? 'text-danger' : 'text-success'}`}>{item.risk} Risk</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--danger)', fontWeight: 800 }}>{item.overdueEmis}</td>
                        <td style={{ fontWeight: 800 }}>{formatCurrency(item.totalOverdueAmt)}</td>
                        <td style={{ color: 'var(--danger)' }}>{formatCurrency(item.totalPenalty)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeReport === 'field-officer' && (
            <>
              <div className="card-header">
                <div style={{ fontWeight: 700, fontSize: 15 }}>Field Officer Performance</div>
                <span className="chip">{data.length} officers</span>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Officer Name</th><th>Total Payments</th><th>Total Collected</th></tr></thead>
                  <tbody>
                    {data.map((item, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 700 }}>{item.name}</td>
                        <td>{item.count} payments</td>
                        <td style={{ fontWeight: 800, color: 'var(--primary)' }}>{formatCurrency(item.totalCollected)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeReport === 'center-performance' && (
            <>
              <div className="card-header">
                <div style={{ fontWeight: 700, fontSize: 15 }}>Center & Group Performance Metrics</div>
                <span className="chip">{data.length} centers</span>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Center/Group</th><th>Active Loans</th><th>Collected</th><th>Outstanding</th><th>Risk</th></tr></thead>
                  <tbody>
                    {data.map((item, i) => (
                      <tr key={i}>
                        <td>
                          <div style={{ fontWeight: 800 }}>{item.centerCode}</div>
                          <div className="text-xs text-muted">{item.groupName}</div>
                        </td>
                        <td className="text-center font-bold">{item.activeLoans}</td>
                        <td style={{ color: 'var(--success)', fontWeight: 700 }}>{formatCurrency(item.totalCollected)}</td>
                        <td style={{ color: 'var(--warning)', fontWeight: 700 }}>{formatCurrency(item.totalOutstanding)}</td>
                        <td>
                          <span className={`badge ${item.riskCategory === 'high' ? 'badge-danger' : 'badge-success'}`}>{item.riskCategory}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeReport === 'clients' && (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Client</th><th>Loans</th><th>Active</th><th>Total Loaned</th><th>Outstanding</th></tr></thead>
                <tbody>
                  {data.map((item, i) => (
                    <tr key={i}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.client?.name}</div>
                        <div className="text-xs text-muted">{item.client?.phone}</div>
                      </td>
                      <td>{item.loanCount}</td>
                      <td>{item.activeLoans > 0 ? <StatusBadge status="active" /> : '—'}</td>
                      <td style={{ fontWeight: 700 }}>{formatCurrency(item.totalLoaned)}</td>
                      <td style={{ color: item.totalOutstanding > 0 ? 'var(--warning)' : 'var(--success)', fontWeight: 700 }}>
                        {formatCurrency(item.totalOutstanding)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
