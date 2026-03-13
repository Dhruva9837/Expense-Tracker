'use client';

import React, { useEffect, useState } from 'react';
import { 
  X, User, Car, Star, Shield, LogOut, 
  ChevronRight, MapPin, CreditCard, Settings,
  TrendingUp, Leaf, IndianRupee, ShieldCheck, Mail
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface AccountDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}
export default function AccountDrawer({ isOpen, onClose }: AccountDrawerProps) {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  useEffect(() => {
    if (user && isOpen) {
      // Fetch Profile for basic info
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data }) => setProfile(data));
    }
  }, [user, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden flex justify-end">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div className={`relative h-full w-[85%] max-w-sm bg-primary shadow-2xl flex flex-col transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="flex-none flex items-center justify-between p-6 border-b border-divider bg-surface-elevated/50">
          <h2 className="text-xl font-black text-textPrimary tracking-tight">Account System</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-surface-elevated rounded-full transition-colors text-textSecondary"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pt-4 pb-32">
          {/* User Quick Info */}
          <div className="mx-6 p-5 bg-gradient-to-br from-accent/10 to-transparent border border-divider rounded-3xl mb-6 flex items-center gap-4">
            {user ? (
              <>
                <div className="w-12 h-12 rounded-2xl bg-accent-burst flex items-center justify-center text-white text-xl font-black shadow-lg shadow-accent/20">
                  {profile?.full_name?.[0]?.toUpperCase() || 'S'}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-textPrimary leading-tight">
                    {profile?.full_name || 'User'}
                  </span>
                  <span className="text-[9px] font-black text-textSecondary uppercase tracking-widest mt-1 opacity-60">
                     Verified Identity
                  </span>
                </div>
              </>
            ) : (
               <Link 
                href="/login" 
                onClick={onClose}
                className="w-full btn-primary py-3 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[9px]"
              >
                Access Center
              </Link>
            )}
          </div>

          {/* New Dashboard Action Buttons */}
          <div className="px-6 grid grid-cols-2 gap-4 mb-8">
            <Link 
              href="/driver" 
              onClick={onClose}
              className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-surface-elevated border border-divider hover:border-accent hover:bg-accent/5 transition-all group active:scale-95 shadow-sm"
            >
              <div className="p-3 bg-accent/10 rounded-2xl group-hover:bg-accent group-hover:text-white transition-all">
                <Car className="w-6 h-6 text-accent group-hover:text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-textPrimary">Driver</span>
            </Link>
            <Link 
              href="/rider" 
              onClick={onClose}
              className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-surface-elevated border border-divider hover:border-success hover:bg-success/5 transition-all group active:scale-95 shadow-sm"
            >
              <div className="p-3 bg-success/10 rounded-2xl group-hover:bg-success group-hover:text-white transition-all">
                <Star className="w-6 h-6 text-success group-hover:text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-textPrimary">Rider</span>
            </Link>
          </div>

            {/* Bio-Impact Quick Preview */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-textSecondary uppercase tracking-[0.3em] pl-2 flex items-center gap-2">
                <Leaf className="w-3.5 h-3.5 text-success" /> Impact Overview
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-surface-elevated/50 rounded-2xl border border-divider flex flex-col items-center text-center">
                  <span className="text-base font-black text-textPrimary leading-none">1.2kg</span>
                  <span className="text-[8px] font-black text-textSecondary uppercase tracking-widest mt-1 opacity-60">CO2 Saved</span>
                </div>
                <div className="p-4 bg-surface-elevated/50 rounded-2xl border border-divider flex flex-col items-center text-center">
                  <span className="text-base font-black text-textPrimary leading-none">{profile?.trust_score || 0}%</span>
                  <span className="text-[8px] font-black text-textSecondary uppercase tracking-widest mt-1 opacity-60">Trust Score</span>
                </div>
              </div>
            </div>
        </div>

        {/* Footer Fixed */}
        <div className="flex-none p-6 border-t border-divider bg-primary shadow-[0_-10px_20px_rgba(0,0,0,0.1)]">
          <button 
            onClick={() => { signOut(); onClose(); }}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-error/20 text-error hover:bg-error hover:text-white transition-all font-black uppercase tracking-widest text-[10px] active:scale-[0.98]"
          >
            <LogOut className="w-5 h-5" />
            Terminate Auth Connection
          </button>
        </div>
      </div>
    </div>
  );
}
