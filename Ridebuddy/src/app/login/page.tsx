'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
    } else {
      router.push('/profile');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md glass-card p-10 shadow-2xl border-divider animate-in zoom-in-95 duration-500 relative z-10">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-textPrimary tracking-tighter mb-2 uppercase">System Entry</h1>
          <p className="text-textSecondary text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Authorize your campus credentials</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-textSecondary uppercase tracking-[0.2em] mb-1.5 block ml-1">Secure Vector (Email)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-surface-elevated rounded-2xl border border-divider focus:ring-2 focus:ring-accent/30 focus:border-accent/40 outline-none transition-all font-black text-textPrimary placeholder:text-textSecondary/30 text-sm"
              placeholder="operator@campus.edu"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-textSecondary uppercase tracking-[0.2em] mb-1.5 block ml-1">Access Cipher (Password)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-surface-elevated rounded-2xl border border-divider focus:ring-2 focus:ring-accent/30 focus:border-accent/40 outline-none transition-all font-black text-textPrimary placeholder:text-textSecondary/30 text-sm"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl animate-in fade-in slide-in-from-top-1">
              <p className="text-accent text-[10px] font-black uppercase tracking-widest leading-relaxed">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-6 flex items-center justify-center gap-4 group transition-all active:scale-95 disabled:grayscale disabled:opacity-30 shadow-xl shadow-accent/20"
          >
            <span className="text-xs uppercase font-black tracking-[0.5em] group-hover:tracking-[0.6em] transition-all">
              {loading ? 'Authorizing...' : 'Establish Link'}
            </span>
          </button>
        </form>

        <p className="mt-10 text-center text-textSecondary text-[10px] font-black uppercase tracking-[0.2em]">
          New Operator?{' '}
          <Link href="/signup" className="text-accent hover:text-white transition-colors ml-2 border-b border-accent/30 pb-0.5">
            Register Segment
          </Link>
        </p>
      </div>
    </div>
  );
}
