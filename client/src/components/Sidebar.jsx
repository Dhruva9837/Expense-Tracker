import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  LayoutDashboard, Users, CreditCard, DollarSign, BarChart2,
  Settings, Shield, FileText, Bell, LogOut, Sun, Moon,
  ChevronLeft, ChevronRight, Wallet, TrendingUp
} from 'lucide-react';

const navItems = [
  { section: 'Overview' },
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { section: 'Operations' },
  { label: 'Groups', to: '/groups', icon: Users },
  { label: 'Loans', to: '/loans', icon: CreditCard },
  { label: 'Collections', to: '/collections', icon: DollarSign },
  { section: 'Analytics' },
  { label: 'Reports', to: '/reports', icon: BarChart2 },
  { label: 'Notifications', to: '/notifications', icon: Bell },
  { section: 'Admin', roles: ['admin'] },
  { label: 'Users', to: '/admin/users', icon: Users, roles: ['admin'] },
  { label: 'Settings', to: '/admin/settings', icon: Settings, roles: ['admin'] },
  { label: 'Audit Logs', to: '/audit', icon: Shield, roles: ['admin'] },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout, isAdmin } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      {/* ── Logo ── */}
      <div style={{
        padding: collapsed ? '18px 0' : '20px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        flexShrink: 0,
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
              flexShrink: 0,
            }}>
              <Wallet size={18} color="white" />
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: 15, letterSpacing: '-0.3px' }}>Pahel</div>
              <div style={{ color: 'rgba(148,163,184,0.6)', fontSize: 10, fontWeight: 500, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Finance</div>
            </div>
          </div>
        )}
        {collapsed && (
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
          }}>
            <Wallet size={18} color="white" />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: '#94a3b8',
              border: 'none',
              cursor: 'pointer',
              borderRadius: 8,
              padding: 6,
              display: 'flex',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            title="Collapse sidebar"
          >
            <ChevronLeft size={15} />
          </button>
        )}
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, paddingTop: 10, paddingBottom: 8, overflow: 'hidden auto' }}>
        {navItems.map((item, idx) => {
          if (item.section) {
            if (item.roles && !isAdmin()) return null;
            return collapsed ? null : (
              <div key={idx} className="nav-section-title">{item.section}</div>
            );
          }
          if (item.roles && !item.roles.includes(user?.role)) return null;
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={18} />
              <span className="nav-label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 8 }}>
        {/* User profile strip */}
        {!collapsed && (
          <div style={{
            margin: '0 10px 8px',
            padding: '10px 12px',
            borderRadius: 10,
            background: 'rgba(255,255,255,0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div className="avatar avatar-sm" style={{ flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: 'white', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <div style={{ color: 'rgba(148,163,184,0.5)', fontSize: 10, textTransform: 'capitalize', letterSpacing: '0.5px', fontWeight: 500 }}>
                {user?.role}
              </div>
            </div>
          </div>
        )}

        <button onClick={toggle} className="nav-item" title={dark ? 'Light Mode' : 'Dark Mode'}>
          {dark ? <Sun size={17} /> : <Moon size={17} />}
          <span className="nav-label">{dark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <button onClick={handleLogout} className="nav-item" style={{ color: 'rgba(239,68,68,0.7)' }} title="Logout">
          <LogOut size={17} />
          <span className="nav-label">Logout</span>
        </button>

        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="nav-item"
            title="Expand"
            style={{ justifyContent: 'center', marginTop: 4 }}
          >
            <ChevronRight size={17} />
          </button>
        )}
      </div>
    </aside>
  );
}
