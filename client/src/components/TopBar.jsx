import { useState, useRef, useEffect } from 'react';
import { Bell, Search, ChevronDown, LogOut, User, Settings, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TopBar({ onMobileMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="topbar">
      {/* Left — mobile menu + search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Mobile hamburger */}
        <button
          className="btn btn-ghost btn-icon"
          onClick={onMobileMenuToggle}
          style={{ display: 'none' }}
          id="mobile-menu-btn"
        >
          <Menu size={20} />
        </button>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            className="form-control"
            placeholder="Search clients, loans…"
            style={{
              paddingLeft: 36,
              minWidth: 240,
              height: 38,
              fontSize: 13,
              background: 'var(--bg)',
              border: '1.5px solid var(--border)',
            }}
          />
        </div>
      </div>

      {/* Right — notif + profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

        {/* Notification Bell */}
        <div ref={notifRef} className="dropdown-container">
          <button
            className="btn btn-ghost btn-icon"
            style={{ position: 'relative', border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text-muted)', borderRadius: 10, width: 38, height: 38 }}
            onClick={() => setNotifOpen(!notifOpen)}
            title="Notifications"
          >
            <Bell size={17} />
            <span className="notif-badge" />
          </button>

          {notifOpen && (
            <div className="dropdown-menu" style={{ minWidth: 280, right: 0 }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>Notifications</div>
              </div>
              {[
                { msg: 'Loan #L-0012 is overdue by 5 days', time: '2h ago', dot: 'var(--danger)' },
                { msg: 'New client Aarav Sharma registered', time: '5h ago', dot: 'var(--success)' },
                { msg: 'Monthly report is ready', time: 'Yesterday', dot: 'var(--accent)' },
              ].map((n, i) => (
                <div key={i} className="dropdown-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2, paddingTop: 12, paddingBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', width: '100%' }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: n.dot, flexShrink: 0, marginTop: 5 }} />
                    <div style={{ fontSize: 13, color: 'var(--text)', flex: 1 }}>{n.msg}</div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', paddingLeft: 15 }}>{n.time}</div>
                </div>
              ))}
              <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                <button onClick={() => { navigate('/notifications'); setNotifOpen(false); }}
                  style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div ref={dropdownRef} className="dropdown-container">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--bg)',
              border: '1.5px solid var(--border)',
              borderRadius: 10,
              padding: '5px 10px 5px 6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
            }}
          >
            <div className="avatar avatar-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>{user?.name}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'capitalize', lineHeight: 1.2 }}>{user?.role}</div>
            </div>
            <ChevronDown size={13} style={{ color: 'var(--text-muted)', transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginLeft: 2 }} />
          </button>

          {dropdownOpen && (
            <div className="dropdown-menu">
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{user?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{user?.email}</div>
              </div>
              <button className="dropdown-item" onClick={() => { navigate('/admin/settings'); setDropdownOpen(false); }}>
                <Settings size={15} /> Account Settings
              </button>
              <div className="dropdown-divider" />
              <button className="dropdown-item danger" onClick={handleLogout}>
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
