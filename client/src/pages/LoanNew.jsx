import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { formatCurrency } from '../utils/formatters';
import { ArrowLeft, Calculator, CreditCard, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoanNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [preview, setPreview] = useState(null);

  const [form, setForm] = useState({
    groupId: searchParams.get('groupId') || '',
    principal: '',
    totalInterest: '',
    emiFrequency: 'Monthly',
    tenure: '12',
    purpose: '',
    disbursedAt: new Date().toISOString().split('T')[0],
    penaltyRate: '2',
    isManualEmi: false,
    manualEmiAmount: '',
    memberIds: [],
    cycleDay: '',
    isManualFirstDate: false,
    firstDueDate: '',
    isManualSchedule: false,
    manualSchedule: [],
  });

  useEffect(() => {
    api.get('/groups', { params: { limit: 1000 } }).then((r) => setGroups(r.data.data));
  }, []);

  useEffect(() => {
    if (form.groupId) {
      setLoadingMembers(true);
      api.get(`/groups/${form.groupId}`)
        .then((res) => {
          const g = res.data.data;
          const members = g.members || [];
          setGroupMembers(members);
          // Auto-select all members by default and sync cycle day
          setForm(prev => ({
            ...prev,
            memberIds: members.map(m => m._id),
            cycleDay: g.meetingDay || prev.cycleDay || 'Monday'
          }));
        })
        .catch(() => toast.error('Failed to load group members'))
        .finally(() => setLoadingMembers(false));
    } else {
      setGroupMembers([]);
      setForm(prev => ({ ...prev, memberIds: [] }));
    }
  }, [form.groupId]);

  const calcEMI = () => {
    const p = Number(form.principal), freq = form.emiFrequency, n = Number(form.tenure), i = Number(form.totalInterest || 0);
    if (!p) return;

    let installments = 0;
    switch (freq) {
      case '15 Days': installments = n * 2; break;
      case 'Weekly': installments = n; break;
      case 'Monthly': default: installments = n; break;
    }

    const totalPayable = p + i;
    let emi;
    if (form.isManualEmi && form.manualEmiAmount) {
      emi = Number(form.manualEmiAmount);
    } else {
      emi = installments > 0 ? totalPayable / installments : totalPayable;
    }

    emi = Math.round(emi * 100) / 100;
    const calculatedTotal = emi * installments;

    setPreview({
      emi,
      installments,
      interest: i,
      total: Math.round(calculatedTotal * 100) / 100,
    });
  };

  useEffect(() => {
    if (form.principal && (form.tenure || form.emiFrequency === 'Weekly')) calcEMI();
  }, [form.principal, form.totalInterest, form.emiFrequency, form.tenure, form.isManualEmi, form.manualEmiAmount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (form.isManualSchedule) {
      if (form.manualSchedule.length === 0) {
        toast.error('Please add at least one installment to the manual schedule');
        setLoading(false);
        return;
      }

      const totalAmount = form.manualSchedule.reduce((sum, item) => sum + Number(item.amount), 0);
      const invalidRows = form.manualSchedule.filter(item => !item.dueDate || !item.amount);
      if (invalidRows.length > 0) {
        toast.error('All manual schedule rows must have a valid date and amount');
        setLoading(false);
        return;
      }

      setPreview({
        emi: form.manualSchedule[0]?.amount || 0,
        installments: form.manualSchedule.length,
        interest: totalAmount > Number(form.principal) ? totalAmount - Number(form.principal) : 0,
        total: totalAmount,
      });
    }

    try {
      const payload = {
        ...form,
        principal: Number(form.principal),
        totalInterest: Number(form.totalInterest || 0),
        tenure: Number(form.tenure),
        manualEmiAmount: form.isManualEmi ? Number(form.manualEmiAmount) : undefined,
        memberIds: form.memberIds,
        // cycleDay: weekday name for Weekly, day-of-month for 15 Days / Monthly
        cycleDay: form.cycleDay || undefined,
        firstDueDate: form.isManualFirstDate ? form.firstDueDate : undefined,
        isManualSchedule: form.isManualSchedule,
        schedule: form.isManualSchedule ? form.manualSchedule : undefined,
      };
      const res = await api.post('/loans', payload);
      toast.success('Loan created successfully');
      navigate(`/loans/${res.data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create loan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <button className="btn btn-secondary btn-sm" style={{ marginBottom: 10 }} onClick={() => navigate('/loans')}><ArrowLeft size={13} /> Back to Loans</button>
          <div className="page-title">Create New Loan</div>
          <div className="page-subtitle">Define loan parameters and calculate EMI</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, alignItems: 'start' }}>
        <form onSubmit={handleSubmit}>
          <div className="card card-body" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CreditCard size={16} color="var(--primary)" /></div>
              <h3 style={{ fontWeight: 700, fontSize: 15 }}>Loan Parameters</h3>
            </div>
            <div className="form-group">
              <label className="form-label">Group *</label>
              <select className="form-control" required value={form.groupId} onChange={(e) => setForm({ ...form, groupId: e.target.value })}>
                <option value="">Select a group</option>
                {groups.map((g) => <option key={g._id} value={g._id}>{g.groupName} — {g.center} ({g.village})</option>)}
              </select>
            </div>

            {form.groupId && (
              <div style={{ marginBottom: 24, padding: '16px', background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Select Members *</label>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {form.memberIds.length} of {groupMembers.length} selected
                  </div>
                </div>

                {loadingMembers ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><div className="spinner" /></div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, maxHeight: 200, overflowY: 'auto', padding: '4px' }}>
                    {groupMembers.map(m => (
                      <label key={m._id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        background: 'var(--bg-card)',
                        borderRadius: 8,
                        border: '1px solid',
                        borderColor: form.memberIds.includes(m._id) ? 'var(--primary)' : 'var(--border)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}>
                        <input
                          type="checkbox"
                          checked={form.memberIds.includes(m._id)}
                          onChange={(e) => {
                            const ids = e.target.checked
                              ? [...form.memberIds, m._id]
                              : form.memberIds.filter(id => id !== m._id);
                            setForm({ ...form, memberIds: ids });
                          }}
                          style={{ width: 16, height: 16 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{m.phone}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                {form.memberIds.length === 0 && !loadingMembers && (
                  <div style={{ marginTop: 8, fontSize: 12, color: 'var(--danger)', fontWeight: 500 }}>
                    ⚠️ At least one member must be selected
                  </div>
                )}
              </div>
            )}

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Principal Amount (₹) *</label>
                <input className="form-control" type="number" min="1000" required value={form.principal} onChange={(e) => setForm({ ...form, principal: e.target.value })} placeholder="100000" />
              </div>
              <div className="form-group">
                <label className="form-label">Total Interest (₹)</label>
                <input className="form-control" type="number" min="0" value={form.totalInterest} onChange={(e) => setForm({ ...form, totalInterest: e.target.value })} placeholder="5000" />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">EMI Frequency *</label>
                <select className="form-control" required value={form.emiFrequency} onChange={(e) => setForm({ ...form, emiFrequency: e.target.value, cycleDay: '' })}>
                  <option value="Monthly">Monthly</option>
                  <option value="15 Days">15 Days</option>
                  <option value="Weekly">Weekly</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tenure ({form.emiFrequency === 'Weekly' ? 'Weeks' : 'Months'}) *</label>
                <input className="form-control" type="number" min="1" max="360" required value={form.tenure} onChange={(e) => setForm({ ...form, tenure: e.target.value })} />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Penalty Rate (%/day overdue)</label>
                <input className="form-control" type="number" step="0.1" value={form.penaltyRate} onChange={(e) => setForm({ ...form, penaltyRate: e.target.value })} />
              </div>

              {/* Weekly — choose a named weekday */}
              {form.emiFrequency === 'Weekly' && (
                <div className="form-group">
                  <label className="form-label">Repayment Day (Weekly Cycle)</label>
                  <select className="form-control" value={form.cycleDay} onChange={(e) => setForm({ ...form, cycleDay: e.target.value })}>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* 15 Days — choose start day of month (1-14); 2nd slot = startDay+15 */}
              {form.emiFrequency === '15 Days' && (
                <div className="form-group">
                  <label className="form-label">Collection Start Day of Month</label>
                  <select
                    className="form-control"
                    value={form.cycleDay}
                    onChange={(e) => setForm({ ...form, cycleDay: e.target.value })}
                  >
                    <option value="">Auto (15-day interval from disbursal)</option>
                    {Array.from({ length: 14 }, (_, i) => i + 1).map(d => (
                      <option key={d} value={d}>
                        {d}th &amp; {d + 15}th of each month
                      </option>
                    ))}
                  </select>
                  {form.cycleDay && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      Collections on the {form.cycleDay}th and {Number(form.cycleDay) + 15}th of every month.
                    </div>
                  )}
                </div>
              )}

              {/* Monthly — choose a specific day of month (1-28) */}
              {form.emiFrequency === 'Monthly' && (
                <div className="form-group">
                  <label className="form-label">Collection Day of Month</label>
                  <select
                    className="form-control"
                    value={form.cycleDay}
                    onChange={(e) => setForm({ ...form, cycleDay: e.target.value })}
                  >
                    <option value="">Auto (1 month from disbursal)</option>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                      <option key={d} value={d}>{d}{d === 1 ? 'st' : d === 2 ? 'nd' : d === 3 ? 'rd' : 'th'} of every month</option>
                    ))}
                  </select>
                  {form.cycleDay && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      EMI is collected on the {form.cycleDay}{Number(form.cycleDay) === 1 ? 'st' : Number(form.cycleDay) === 2 ? 'nd' : Number(form.cycleDay) === 3 ? 'rd' : 'th'} of every month.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ padding: '15px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)', marginBottom: 16 }}>
              <div className="form-group" style={{ marginBottom: form.isManualFirstDate ? 15 : 0 }}>
                <label className="checkbox-container" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.isManualFirstDate}
                    onChange={(e) => setForm({ ...form, isManualFirstDate: e.target.checked })}
                    style={{ width: 18, height: 18 }}
                  />
                  <span style={{ fontWeight: 600 }}>Set First Due Date Manually</span>
                </label>
              </div>

              {form.isManualFirstDate && (
                <div className="form-group">
                  <input
                    className="form-control"
                    type="date"
                    required
                    value={form.firstDueDate}
                    onChange={(e) => setForm({ ...form, firstDueDate: e.target.value })}
                  />
                  <div className="text-xs text-muted mt-2">Next installments will automatically follow the defined frequency from this date.</div>
                </div>
              )}
            </div>

            <div style={{ padding: '15px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)', marginBottom: 20 }}>
              <div className="form-group" style={{ marginBottom: form.isManualSchedule || form.isManualEmi ? 15 : 0 }}>
                <label className="checkbox-container" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 10 }}>
                  <input
                    type="checkbox"
                    checked={form.isManualSchedule}
                    onChange={(e) => setForm({
                      ...form,
                      isManualSchedule: e.target.checked,
                      isManualEmi: false, // Mutual exclusion
                      manualSchedule: e.target.checked && form.manualSchedule.length === 0 ? [{ installmentNumber: 1, dueDate: '', amount: '' }] : form.manualSchedule
                    })}
                    style={{ width: 18, height: 18 }}
                  />
                  <span style={{ fontWeight: 600 }}>Create Full EMI Schedule Manually</span>
                </label>

                {!form.isManualSchedule && (
                  <label className="checkbox-container" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.isManualEmi}
                      onChange={(e) => setForm({ ...form, isManualEmi: e.target.checked })}
                      style={{ width: 18, height: 18 }}
                    />
                    <span style={{ fontWeight: 600 }}>Set Fixed EMI Amount Manually (Auto Dates)</span>
                  </label>
                )}
              </div>

              {form.isManualEmi && !form.isManualSchedule && (
                <div className="form-group">
                  <label className="form-label">Manual EMI Amount (₹) *</label>
                  <input
                    className="form-control"
                    type="number"
                    required
                    value={form.manualEmiAmount}
                    onChange={(e) => setForm({ ...form, manualEmiAmount: e.target.value })}
                    placeholder="Enter EMI amount"
                  />
                </div>
              )}

              {form.isManualSchedule && (
                <div style={{ marginTop: 15 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <label className="form-label mb-0">Custom EMI Schedule</label>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setForm(prev => ({
                        ...prev,
                        manualSchedule: [...prev.manualSchedule, { installmentNumber: prev.manualSchedule.length + 1, dueDate: '', amount: '' }]
                      }))}
                    >
                      <Plus size={14} /> Add Row
                    </button>
                  </div>

                  <div className="table-responsive" style={{ maxHeight: 300, overflowY: 'auto' }}>
                    <table className="table" style={{ minWidth: '100%' }}>
                      <thead style={{ position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 1 }}>
                        <tr>
                          <th style={{ width: '60px' }}>#</th>
                          <th>Due Date</th>
                          <th>Amount (₹)</th>
                          <th style={{ width: '60px', textAlign: 'center' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {form.manualSchedule.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>
                              <input
                                type="date"
                                className="form-control"
                                style={{ padding: '6px 10px', height: '34px' }}
                                value={item.dueDate}
                                onChange={e => {
                                  const newSchedule = [...form.manualSchedule];
                                  newSchedule[index].dueDate = e.target.value;
                                  setForm({ ...form, manualSchedule: newSchedule });
                                }}
                                required
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control"
                                style={{ padding: '6px 10px', height: '34px' }}
                                value={item.amount}
                                onChange={e => {
                                  const newSchedule = [...form.manualSchedule];
                                  newSchedule[index].amount = e.target.value;
                                  setForm({ ...form, manualSchedule: newSchedule });
                                }}
                                required
                              />
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                                onClick={() => {
                                  const newSchedule = form.manualSchedule.filter((_, i) => i !== index)
                                    .map((row, i) => ({ ...row, installmentNumber: i + 1 }));
                                  setForm({ ...form, manualSchedule: newSchedule });
                                }}
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {form.manualSchedule.length > 0 && (
                    <div style={{ marginTop: 10, textAlign: 'right', fontWeight: 600, fontSize: 13, color: 'var(--text-muted)' }}>
                      Total: ₹{form.manualSchedule.reduce((sum, item) => sum + Number(item.amount || 0), 0)}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Disbursal Date</label>
                <input className="form-control" type="date" value={form.disbursedAt} onChange={(e) => setForm({ ...form, disbursedAt: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Loan Purpose</label>
                <input className="form-control" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} placeholder="Agriculture, Business..." />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate('/loans')}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? <div className="spinner" /> : <><Plus size={16} /> Create Loan</>}
            </button>
          </div>
        </form>

        {/* EMI Preview */}
        <div style={{ position: 'sticky', top: 24 }}>
          <div className="card card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Calculator size={16} color="var(--success)" /></div>
              <h3 style={{ fontWeight: 700, fontSize: 15 }}>EMI Calculator</h3>
            </div>
            {preview ? (
              <div>
                {/* Hero EMI display */}
                <div style={{ padding: '20px 16px', background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(99,102,241,0.04))', borderRadius: 12, textAlign: 'center', marginBottom: 16, border: '1px solid rgba(99,102,241,0.15)' }}>
                  <div className="text-xs text-muted" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>
                    {form.emiFrequency} EMI
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--primary)', letterSpacing: '-1px' }}>{formatCurrency(preview.emi)}</div>
                </div>

                {[
                  ['Principal', formatCurrency(Number(form.principal))],
                  ['Total Interest', formatCurrency(preview.interest)],
                  ['Total Payable', formatCurrency(preview.total)],
                  ['Total Installments', preview.installments],
                  ['Frequency', form.emiFrequency],
                  ['Tenure', form.emiFrequency === 'Weekly' ? `${form.tenure} weeks` : `${form.tenure} months`],
                ].map(([k, v]) => (
                  <div key={k} className="stat-row">
                    <span className="stat-label">{k}</span>
                    <span className="stat-value">{v}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 40 }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🧮</div>
                <h3>EMI Preview</h3>
                <p>Fill in the loan details to see the EMI calculation.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
