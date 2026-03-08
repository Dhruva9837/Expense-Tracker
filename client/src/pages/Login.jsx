import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Wallet, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg, #020917 0%, #0d1526 40%, #111827 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decorations */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 65%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '40%', left: '30%', width: 2, height: 300, background: 'linear-gradient(180deg, transparent, rgba(99,102,241,0.1), transparent)', transform: 'rotate(20deg)' }} />
      </div>

      {/* Left panel — shown on larger screens */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 80px',
        maxWidth: 560,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 60 }}>
          <div style={{
            width: 42, height: 42,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
          }}>
            <Wallet size={22} color="white" />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 18, letterSpacing: '-0.3px' }}>Pahel Finance</div>
            <div style={{ color: 'rgba(148,163,184,0.6)', fontSize: 11, letterSpacing: '0.8px', textTransform: 'uppercase', fontWeight: 500 }}>Loan Management</div>
          </div>
        </div>

        <div style={{ marginBottom: 40 }}>
          <h1 style={{ color: 'white', fontSize: 38, fontWeight: 900, lineHeight: 1.1, marginBottom: 16, letterSpacing: '-1.5px' }}>
            Manage loans<br />
            <span style={{ background: 'linear-gradient(90deg, #6366f1, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              with confidence.
            </span>
          </h1>
          <p style={{ color: 'rgba(148,163,184,0.7)', fontSize: 15, lineHeight: 1.7, maxWidth: 380 }}>
            A complete fintech platform for managing clients, loans, repayments, and reports — all in one place.
          </p>
        </div>

        {/* Feature chips */}
        {[
          { icon: '🛡️', label: 'Bank-grade security' },
          { icon: '📊', label: 'Real-time analytics' },
          { icon: '🔔', label: 'Instant overdue alerts' },
        ].map((f) => (
          <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 18 }}>{f.icon}</span>
            <span style={{ color: 'rgba(148,163,184,0.8)', fontSize: 14, fontWeight: 500 }}>{f.label}</span>
          </div>
        ))}
      </div>

      {/* Right panel — login form */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        flex: '0 0 440px',
        maxWidth: '100%',
      }}>
        <div style={{
          width: '100%',
          maxWidth: 400,
          background: 'rgba(15,26,46,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24,
          padding: '40px 36px',
          boxShadow: '0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}>
          {/* Form header */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ color: 'white', fontSize: 24, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.5px' }}>Sign in</h2>
            <p style={{ color: 'rgba(148,163,184,0.7)', fontSize: 14 }}>Enter your credentials to access your dashboard</p>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 20, background: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.2)', color: '#fca5a5' }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(148,163,184,0.9)', marginBottom: 8 }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="admin@pahel.io"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1.5px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  color: 'white',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(148,163,184,0.9)', marginBottom: 8 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '11px 44px 11px 14px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1.5px solid rgba(255,255,255,0.1)',
                    borderRadius: 10,
                    color: 'white',
                    fontSize: 14,
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(148,163,184,0.6)', display: 'flex', padding: 2 }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 6,
                width: '100%',
                padding: '13px',
                background: loading ? 'rgba(99,102,241,0.6)' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                border: 'none',
                borderRadius: 10,
                color: 'white',
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontFamily: 'inherit',
                boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
                transition: 'all 0.2s',
                letterSpacing: '0.2px',
              }}
            >
              {loading ? <div className="spinner" /> : <><span>Sign In</span><ArrowRight size={17} /></>}
            </button>
          </form>

          {/* Demo credentials */}
          <div style={{
            marginTop: 24,
            padding: '13px 16px',
            background: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
              <ShieldCheck size={14} style={{ color: '#818cf8' }} />
              <span style={{ color: '#818cf8', fontSize: 12, fontWeight: 600 }}>Demo Credentials</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <code style={{ color: 'rgba(199,210,254,0.8)', fontSize: 12 }}>admin@pahel.io</code>
              <code style={{ color: 'rgba(199,210,254,0.8)', fontSize: 12 }}>Admin@123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
