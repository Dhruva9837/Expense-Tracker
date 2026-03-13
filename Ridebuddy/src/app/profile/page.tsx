'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { 
  User, Mail, Phone, Building2, Save, Shield, 
  ChevronLeft, Settings, ShieldCheck 
} from 'lucide-react';
import Link from 'next/link';

interface Profile {
  full_name: string;
  university_email: string;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    university_email: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setProfile({
              full_name: data.full_name || '',
              university_email: data.university_email || '',
            });
          }
        });
    }
  }, [user, authLoading, router]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: profile.full_name })
        .eq('id', user.id);
      if (error) throw error;
      alert('Secure Profile Updated');
    } catch (error) {
      alert('Transmission Error');
    }
    setSaving(false);
  };

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-primary"><div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen pb-24 bg-primary overflow-x-hidden">
      <Navbar />
      
      {/* Background Decorative Elements */}
      <div className="fixed top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      
      <main className="max-w-md mx-auto px-4 pt-16 space-y-8 relative z-10">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-textPrimary tracking-tighter">Account Matrix</h1>
            <p className="text-textSecondary text-[10px] font-black uppercase tracking-widest mt-2 leading-relaxed opacity-60">System Identity Settings</p>
          </div>
          <div className="w-16 h-16 rounded-3xl bg-accent-burst flex items-center justify-center text-white text-2xl font-black border-2 border-primary shadow-xl shadow-accent/20 rotate-3 animate-pulse-slow">
            {profile.full_name?.[0]?.toUpperCase() || 'S'}
          </div>
        </header>

        {/* Identity Matrix Form */}
        <div className="glass-card p-10 shadow-lg border-divider space-y-10 relative overflow-hidden">
          <h2 className="text-[10px] font-black text-textPrimary uppercase tracking-[0.3em] flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-accent" /> Identity Matrix
          </h2>
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-textSecondary uppercase tracking-[0.2em] mb-1.5 block ml-1">Universal Designation</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                <input 
                  type="text" 
                  value={profile.full_name} 
                  onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-surface-elevated rounded-2xl border border-divider focus:ring-2 focus:ring-accent/30 outline-none font-bold text-textPrimary text-sm transition-all" 
                />
              </div>
            </div>
            <div className="space-y-2 opacity-60">
              <label className="text-[9px] font-black text-textSecondary uppercase tracking-[0.2em] mb-1.5 block ml-1">Secure Vector (Email)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
                <input 
                  type="email" 
                  value={profile.university_email} 
                  disabled
                  className="w-full pl-12 pr-4 py-4 bg-primary/20 rounded-2xl border border-divider text-textSecondary font-black text-sm cursor-not-allowed" 
                />
              </div>
            </div>
          </div>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full btn-primary py-6 mt-6 flex items-center justify-center gap-4 transition-all font-black text-[10px] uppercase tracking-[0.4em] active:scale-[0.98]"
          >
            {saving ? 'Transmitting...' : 'Update Matrix'}
          </button>
        </div>

        {/* Verification Status */}
        <div className="glass-card p-6 bg-accent/5 border-accent/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs font-black text-textPrimary uppercase tracking-widest">Verified Alumnus</p>
              <p className="text-[9px] font-bold text-textSecondary uppercase mt-0.5">Matrix Clearance Active</p>
            </div>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
        </div>
      </main>
    </div>
  );
}
