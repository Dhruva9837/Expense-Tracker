'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRides } from '@/hooks/useRides';
import Navbar from '@/components/layout/Navbar';
import RideCard from '@/components/rides/RideCard';
import { Search, SlidersHorizontal, MapPin, ArrowLeft, Navigation, Filter, Sparkles, Bike, PlusCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

function RideDiscoveryContent() {
  const { rides, isLoading } = useRides();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const dest = searchParams.get('destination');
    const pick = searchParams.get('pickup');
    if (dest) {
      setSearchTerm(dest);
    } else if (pick) {
      setSearchTerm(pick);
    }
  }, [searchParams]);

  const filteredRides = rides?.filter(ride => {
    const searchLower = searchTerm.toLowerCase();
    
    // If searchTerm matches the initial URL exactly, we can try to filter by both
    const urlPick = searchParams.get('pickup')?.toLowerCase() || '';
    const urlDest = searchParams.get('destination')?.toLowerCase() || '';
    
    if (searchTerm === (searchParams.get('destination') || searchParams.get('pickup') || '')) {
      const matchPick = urlPick ? (ride.pickup_landmark?.name?.toLowerCase().includes(urlPick) ?? false) : true;
      const matchDest = urlDest ? (ride.destination_landmark?.name?.toLowerCase().includes(urlDest) ?? false) : true;
      if (urlPick || urlDest) return matchPick && matchDest;
    }

    return (ride.pickup_landmark?.name?.toLowerCase().includes(searchLower) ?? false) ||
           (ride.destination_landmark?.name?.toLowerCase().includes(searchLower) ?? false);
  });

  return (
    <div className="min-h-screen pb-24 bg-primary overflow-x-hidden">
      <Navbar />

      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-80 h-80 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      
      <main className="max-w-md mx-auto px-4 pt-16 space-y-8 relative z-10">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button onClick={() => router.push('/')} className="w-10 h-10 glass-card flex items-center justify-center text-textSecondary hover:text-accent transition-all active:scale-95 border-divider">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Bike className="w-4 h-4 text-accent" />
              <span className="text-[9px] font-black uppercase tracking-widest text-accent">2-Wheeler Only</span>
            </div>
            <button className="w-10 h-10 glass-card flex items-center justify-center text-textSecondary hover:text-accent transition-all active:scale-95 border-divider">
              <Filter className="w-5 h-5" />
            </button>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-info bg-info/10 px-3 py-1.5 rounded-xl border border-info/20">Rider Section</span>
            </div>
            <h1 className="text-2xl font-black text-textPrimary tracking-tighter">Find a Ride</h1>
            <p className="text-textSecondary text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60">Browse available 2-wheeler rides</p>
          </div>
          {/* Post Ride Request CTA */}
          <button
            onClick={() => router.push('/request-ride')}
            className="w-full flex items-center justify-between gap-3 p-5 bg-info/10 border border-info/30 rounded-2xl hover:bg-info/20 transition-all group active:scale-95"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-info/20 rounded-xl">
                <PlusCircle className="w-5 h-5 text-info" />
              </div>
              <div className="text-left">
                <p className="text-sm font-black text-textPrimary">Need a ride?</p>
                <p className="text-[10px] font-bold text-textSecondary uppercase tracking-wider mt-0.5">Post a ride request for drivers</p>
              </div>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-info bg-info/20 px-3 py-2 rounded-xl group-hover:bg-info/30 transition-colors">Post Request →</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-accent-burst rounded-xl flex items-center justify-center text-white shadow-lg shadow-accent/20 group-focus-within:scale-110 transition-all duration-300">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search destination..."
            className="w-full pl-[4.5rem] pr-6 py-6 bg-surface rounded-[2rem] border border-divider shadow-sm outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all font-black text-textPrimary placeholder:font-bold placeholder:text-textSecondary/40 text-sm tracking-tight"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Results Info */}
        {!isLoading && filteredRides && (
          <div className="flex items-center justify-between px-2">
            <p className="text-[10px] font-black text-textSecondary uppercase tracking-widest">
              Available Shifts • {filteredRides.length}
            </p>
            <div className="h-[1px] flex-1 bg-divider/30 mx-4" />
          </div>
        )}

        {/* Error/Loading/Empty States */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 glass-card animate-pulse shadow-sm" />
            ))}
          </div>
        ) : filteredRides?.length === 0 ? (
          <div className="text-center py-20 glass-card shadow-sm mt-10">
            <div className="w-20 h-20 bg-surface-elevated rounded-full flex items-center justify-center mb-6 mx-auto text-textSecondary/20 border border-divider">
               <Navigation className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-textPrimary tracking-tight">Empty Route</h3>
            <p className="text-textSecondary font-bold text-xs max-w-[15rem] mx-auto mt-2 leading-relaxed">
              No active rides matching your search. Be the one to start this trail!
            </p>
            <button 
              onClick={() => setSearchTerm('')}
              className="mt-8 text-accent font-black text-[10px] uppercase tracking-widest hover:underline px-6 py-3 bg-accent/10 rounded-xl"
            >
              Clear Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {filteredRides?.map((ride, index) => (
              <RideCard 
                key={ride.id} 
                ride={ride} 
                isRecommended={index === 0 && !searchTerm} // Recommend first if not searching
                onClick={() => router.push(`/rides/${ride.id}`)} 
              />
            ))}
          </div>
        )}

        {/* Campus Tip */}
        {!isLoading && (
          <div className="py-8 text-center glass-card border-accent/20 p-6 shadow-sm overflow-hidden relative group">
            <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 bg-surface-elevated rounded-2xl flex items-center justify-center text-accent mx-auto border border-divider mb-4 relative z-10 transition-transform group-hover:rotate-12">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-textPrimary font-black text-xs uppercase tracking-widest relative z-10">Eco Trail 🚲</p>
            <p className="text-textSecondary text-[10px] font-bold mt-2 leading-relaxed relative z-10 max-w-[15rem] mx-auto">RideBuddy reduces carbon footprints by matching students on similar routes.</p>
          </div>
        )}

        {/* Float Action - Show Go Back if searching */}
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-accent shadow-lg shadow-accent/20 text-white px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.2em] z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 active:scale-95"
          >
            Reset Filters
          </button>
        )}
      </main>
    </div>
  );
}

export default function RideDiscovery() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-primary" />}>
      <RideDiscoveryContent />
    </Suspense>
  );
}
