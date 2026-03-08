import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Settings, Save, Sliders, Info, Building, DollarSign, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const configSections = [
  {
    icon: Building,
    title: 'Company',
    fields: [
      { key: 'companyName', label: 'Company Name', type: 'text', placeholder: 'Pahel Finance' },
      { key: 'currency', label: 'Currency Symbol', type: 'text', placeholder: '₹' },
    ],
  },
  {
    icon: DollarSign,
    title: 'Loan Defaults',
    fields: [
      { key: 'defaultInterestRate', label: 'Default Interest Rate (%)', type: 'number', min: 0, max: 100, placeholder: '12' },
      { key: 'defaultTenure', label: 'Default Tenure (months)', type: 'number', min: 1, placeholder: '12' },
      { key: 'maxLoanAmount', label: 'Maximum Loan Amount (₹)', type: 'number', min: 0, placeholder: '500000' },
    ],
  },
  {
    icon: AlertCircle,
    title: 'Penalties',
    fields: [
      { key: 'defaultPenaltyRate', label: 'Penalty Rate (% per day)', type: 'number', min: 0, placeholder: '2' },
    ],
  },
];

const refCards = [
  { icon: DollarSign, title: 'Interest Rate', desc: 'Applied to all new loans by default. Can be overridden per-loan during creation.' },
  { icon: AlertCircle, title: 'Penalty Rate', desc: 'Charged per day for overdue EMIs. Applied automatically by the system.' },
  { icon: Clock, title: 'Default Tenure', desc: 'Pre-filled tenure when creating new loans to speed up the workflow.' },
  { icon: Building, title: 'Max Loan Amount', desc: 'Upper safety limit enforced during loan creation for risk management.' },
];

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/settings').then((r) => setSettings(r.data.data)).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings', settings);
      toast.success('Settings saved successfully');
    } catch { toast.error('Failed to save settings'); }
    finally { setSaving(false); }
  };

  const set = (key, val) => setSettings((s) => ({ ...s, [key]: val }));

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <div className="page-title">System Settings</div>
          <div className="page-subtitle">Configure loan defaults, interest rates and system preferences</div>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? <div className="spinner" /> : <><Save size={15} /> Save Settings</>}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20, alignItems: 'start' }}>
        {/* Config panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {configSections.map(({ icon: Icon, title, fields }) => (
            <div key={title} className="card card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={17} color="var(--primary)" />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 15 }}>{title}</h3>
              </div>

              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {fields.map((_, i) => <div key={i} className="skeleton" style={{ height: 40 }} />)}
                </div>
              ) : (
                <div className="grid-2">
                  {fields.map(({ key, label, type, min, max, placeholder }) => (
                    <div key={key} className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">{label}</label>
                      <input
                        className="form-control"
                        type={type}
                        min={min}
                        max={max}
                        placeholder={placeholder}
                        value={settings[key] ?? ''}
                        onChange={(e) => set(key, type === 'number' ? Number(e.target.value) : e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Notification toggles */}
          <div className="card card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sliders size={17} color="var(--primary)" />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 15 }}>System Preferences</h3>
            </div>
            {[
              { label: 'Email notifications for overdue loans', key: 'notifOverdue', default: true },
              { label: 'Auto-calculate penalties for overdue EMIs', key: 'autoPenalty', default: true },
              { label: 'Send SMS for new loan disbursals', key: 'smsOnDisbursal', default: false },
            ].map((toggle) => (
              <div key={toggle.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{toggle.label}</div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    defaultChecked={settings[toggle.key] ?? toggle.default}
                    onChange={(e) => set(toggle.key, e.target.checked)}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Reference cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ padding: '12px 16px', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 'var(--radius)', display: 'flex', gap: 10 }}>
            <Info size={15} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Settings apply system-wide unless overridden per loan. Changing rates won't affect existing loans.
            </div>
          </div>

          {refCards.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card card-body" style={{ padding: 16 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={15} color="var(--text-muted)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: 'var(--text)' }}>{title}</div>
                  <div className="text-sm text-muted" style={{ lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
