import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="layout">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 49,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className="main-content">
        <TopBar onMobileMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <div className="page-content">
          <div className="page-enter">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
