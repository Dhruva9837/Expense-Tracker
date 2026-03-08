import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Clients = lazy(() => import('./pages/Clients'));
const ClientNew = lazy(() => import('./pages/ClientNew'));
const ClientDetail = lazy(() => import('./pages/ClientDetail'));
const Groups = lazy(() => import('./pages/Groups'));
const GroupNew = lazy(() => import('./pages/GroupNew'));
const GroupDetail = lazy(() => import('./pages/GroupDetail'));
const Loans = lazy(() => import('./pages/Loans'));
const LoanNew = lazy(() => import('./pages/LoanNew'));
const LoanDetail = lazy(() => import('./pages/LoanDetail'));
const Collections = lazy(() => import('./pages/Collections'));
const Reports = lazy(() => import('./pages/Reports'));
const AuditLogs = lazy(() => import('./pages/AuditLogs'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));

const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                fontSize: '14px',
                boxShadow: 'var(--shadow-lg)',
              },
            }}
          />
          <Suspense fallback={<Loading />}>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Protected — All authenticated users */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/clients/new" element={<ClientNew />} />
                  <Route path="/clients/:id" element={<ClientDetail />} />
                  <Route path="/groups" element={<Groups />} />
                  <Route path="/groups/new" element={<GroupNew />} />
                  <Route path="/groups/:id" element={<GroupDetail />} />
                  <Route path="/loans" element={<Loans />} />
                  <Route path="/loans/new" element={<LoanNew />} />
                  <Route path="/loans/:id" element={<LoanDetail />} />
                  <Route path="/collections" element={<Collections />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/notifications" element={<div className="page-title" style={{ padding: 20 }}>🔔 Notifications — Coming Soon</div>} />
                </Route>
              </Route>

              {/* Admin only */}
              <Route element={<ProtectedRoute roles={['admin']} />}>
                <Route element={<Layout />}>
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/settings" element={<AdminSettings />} />
                  <Route path="/audit" element={<AuditLogs />} />
                </Route>
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
