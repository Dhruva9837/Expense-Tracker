import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { formatCurrency, formatDate, monthName } from '../utils/formatters';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Users, CreditCard, DollarSign, AlertTriangle, TrendingUp, TrendingDown,
  Wallet, CheckCircle, Clock, ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';
import { SkeletonCard, SkeletonTable } from '../components/Skeleton';
import StatusBadge from '../components/StatusBadge';

const PIE_COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#ef4444'];

const KPICard = ({ label, value, icon: Icon, color, trend, trendLabel, sub }) => (
  <div className="kpi-card" style={{ '--kpi-color': color }}>
    <div className="kpi-icon" style={{ background: `${color}18`, border: `1px solid ${color}25` }}>
      <Icon size={22} color={color} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value ?? '—'}</div>
      {(trend !== undefined || sub) && (
        <div className={`kpi-trend${trend !== undefined ? (trend >= 0 ? ' up' : ' down') : ''}`}>
          {trend !== undefined && (
            trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />
          )}
          <span>{sub || trendLabel}</span>
        </div>
      )}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '10px 14px',
      boxShadow: 'var(--shadow-lg)',
      fontSize: 13,
    }}>
      <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color }}>
          {formatCurrency(p.value)}
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { data: dashboardData, isLoading: loading, error } = useQuery({
    queryKey: ['dashboard', 'kpi'],
    queryFn: async () => {
      try {
        const response = await api.get('/dashboard/kpi');
        return response.data.data;
      } catch (err) {
        console.error('Dashboard KPI fetch failed:', err);
        throw err;
      }
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const data = dashboardData || {};

  const trendData = data.monthlyTrend?.map((m) => ({
    name: monthName(m._id.month),
    amount: m.total || 0,
    count: m.count || 0,
  })) || [];

  const pieData = [
    { name: 'Active', value: data.activeLoans || 0 },
    { name: 'Closed', value: data.closedLoans || 0 },
    { name: 'Pending', value: data.pendingLoans || 0 },
    { name: 'Defaulted', value: data.defaultedLoans || 0 },
  ];

  const totalPie = pieData.reduce((s, d) => s + d.value, 0);

  if (error) {
    return (
      <div className="page-enter">
        <div className="error-alert" style={{ padding: '24px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius)', border: '1px solid var(--danger)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={24} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px' }}>Dashboard Load Error</div>
              <div style={{ fontSize: '14px', marginTop: '4px' }}>Unable to retrieve dashboard data. Please check your connection or contact support.</div>
              <button onClick={() => window.location.reload()} className="btn btn-sm btn-danger" style={{ marginTop: '12px' }}>Retry</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Dashboard</h1>
          <p className="page-subtitle">Real-time overview of your loan portfolio & collections</p>
        </div>
        <div className="chip">
          <Clock size={13} />
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <KPICard label="Total Clients" value={data.totalClients?.toLocaleString('en-IN')} icon={Users} color="#10b981" sub="Registered borrowers" />
            <KPICard label="Total Disbursed" value={formatCurrency(data.totalDisbursed)} icon={Wallet} color="#10b981" sub="Across all loans" />
            <KPICard label="Outstanding Balance" value={formatCurrency(data.outstandingBalance)} icon={TrendingUp} color="#f59e0b" sub="Pending recovery" />
            <KPICard label="Today's Collection" value={formatCurrency(data.todayCollection)} icon={DollarSign} color="#0ea5e9" sub="Collected today" />
            <KPICard label="Month Collection" value={formatCurrency(data.monthCollection)} icon={Activity} color="#8b5cf6" sub="This month" />
            <KPICard label="Active Loans" value={data.activeLoans} icon={CreditCard} color="#10b981" sub="Running loans" />
            <KPICard label="Overdue Loans" value={data.overdueLoans} icon={AlertTriangle} color="#ef4444" sub="Require attention" />
            <KPICard label="Closed Loans" value={data.closedLoans} icon={CheckCircle} color="#10b981" sub="Fully repaid" />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Area Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Monthly Collection Trend</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Last 6 months</div>
            </div>
            <div className="chip" style={{ fontSize: 11 }}>
              <TrendingUp size={11} />
              Collection volume
            </div>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="skeleton" style={{ height: 230 }} />
            ) : trendData.length === 0 ? (
              <div className="empty-state" style={{ padding: 40 }}>
                <div className="empty-state-icon">📈</div>
                <p>No trend data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={trendData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <defs>
                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#colorAmt)"
                    dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: '#10b981', stroke: 'white', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="card">
          <div className="card-header">
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Loan Distribution</div>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="skeleton" style={{ height: 230 }} />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={80}
                      dataKey="value"
                      paddingAngle={3}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                  {pieData.map((d, i) => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i], flexShrink: 0 }} />
                        <span style={{ color: 'var(--text-muted)' }}>{d.name}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ fontWeight: 700, color: 'var(--text)' }}>{d.value}</span>
                        <span style={{ color: 'var(--text-subtle)' }}>{totalPie ? `${((d.value / totalPie) * 100).toFixed(0)}%` : ''}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
        {/* Portfolio Health */}
        <div className="card">
          <div className="card-header">
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>Portfolio Health</div>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="skeleton" style={{ height: 120 }} />
            ) : (
              <div>
                {[
                  { label: 'Recovery Rate', pct: data?.closedLoans && data?.activeLoans ? Math.round((data.closedLoans / (data.closedLoans + data.activeLoans)) * 100) : 0, color: '#10b981' },
                  { label: 'Overdue Rate', pct: data?.overdueLoans && data?.activeLoans ? Math.round((data.overdueLoans / data.activeLoans) * 100) : 0, color: '#ef4444' },
                ].map((s) => (
                  <div key={s.label} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</span>
                      <span style={{ color: s.color, fontWeight: 700 }}>{s.pct}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${s.pct}%`, background: s.color }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="card">
          <div className="card-header">
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>Quick Stats</div>
          </div>
          <div className="card-body" style={{ padding: '0 22px' }}>
            {loading ? (
              <div className="skeleton" style={{ height: 120, margin: '22px 0' }} />
            ) : (
              <>
                <div className="stat-row">
                  <span className="stat-label">Avg. Loan Amount</span>
                  <span className="stat-value">{data?.totalDisbursed && data?.activeLoans ? formatCurrency(data.totalDisbursed / Math.max(data.activeLoans, 1)) : '—'}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Pending Loans</span>
                  <span className="stat-value">{data?.pendingLoans ?? '—'}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Defaulted</span>
                  <span className="stat-value" style={{ color: 'var(--danger)' }}>{data?.defaultedLoans ?? '—'}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Today's Kist Shortcut */}
        <div className="card" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', border: 'none' }}>
          <div className="card-body" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Today's Collection</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'white', letterSpacing: '-1px', lineHeight: 1.1 }}>
              {loading ? '—' : formatCurrency(data?.todayCollection)}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Payments recorded today</div>
            <Link
              to="/collections"
              className="btn btn-sm"
              style={{ marginTop: 8, background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', alignSelf: 'flex-start', textDecoration: 'none' }}
            >
              📝 Kist Likho →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
