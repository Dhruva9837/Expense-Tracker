'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Car, User, LogOut, Search, PlusCircle } from 'lucide-react';
import AccountDrawer from './AccountDrawer';

export default function Navbar() {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-primary/80 backdrop-blur-lg border-t border-divider px-6 py-3 md:top-0 md:bottom-auto md:border-t-0 md:border-b z-50">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <Link href="/" className="hidden md:flex items-center gap-2 text-accent font-bold text-xl tracking-tighter">
            <Car className="w-6 h-6 fill-accent" />
            <span>RideBuddy</span>
          </Link>

          <div className="flex items-center justify-around w-full md:w-auto md:gap-8">
            {!mounted || loading ? (
               <div className="flex gap-4 opacity-50 px-4">
                  <div className="w-16 h-8 bg-surface-elevated animate-pulse rounded-lg" />
                  <div className="w-16 h-8 bg-surface-elevated animate-pulse rounded-lg" />
               </div>
            ) : user ? (
              <>
                <Link href="/" className="flex flex-col md:flex-row items-center gap-1 text-textSecondary hover:text-accent transition-colors">
                  <Car className="w-5 h-5 md:hidden" />
                  <span className="text-[10px] md:text-sm font-bold uppercase tracking-widest md:normal-case md:tracking-normal">Home</span>
                </Link>

                <Link href="/rides" className="flex flex-col md:flex-row items-center gap-1 text-textSecondary hover:text-accent transition-colors">
                  <Search className="w-5 h-5" />
                  <span className="text-[10px] md:text-sm font-bold uppercase tracking-widest md:normal-case md:tracking-normal">Explore</span>
                </Link>

                <button 
                  onClick={() => setIsDrawerOpen(true)}
                  className="flex flex-col md:flex-row items-center gap-1 text-textSecondary hover:text-accent transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="text-[10px] md:text-sm font-bold uppercase tracking-widest md:normal-case md:tracking-normal">My Account</span>
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-xs md:text-sm font-black uppercase tracking-widest text-textPrimary hover:text-accent transition-colors py-2 px-4">
                  Login
                </Link>
                <Link href="/signup" className="text-xs md:text-sm font-black uppercase tracking-widest bg-accent text-white hover:bg-accent/90 transition-colors py-2 px-6 rounded-xl shadow-md">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <AccountDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </>
  );
}
