'use client';

import { useState } from 'react';
import { useRides } from '@/hooks/useRides';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { MapPin, Users, IndianRupee, Navigation, Clock, Info, Bike } from 'lucide-react';

const CAMPUS_LANDMARKS = [
  'Main Gate', 'Hostel Block A', 'Hostel Block B', 'Library', 
  'Tech Park', 'Management Block', 'Sports Complex', 'Admin Building',
  'Canteen', 'Cafeteria', 'Auditorium', 'Science Lab'
];

export default function RequestRide() {
  const { createPassengerRequest, isCreatingPassengerRequest, landmarks, isLoadingLandmarks } = useRides();
  const router = useRouter();

  const [formData, setFormData] = useState({
    pickup_landmark_id: '',
    destination_landmark_id: '',
    departure_time: '',
    seats_needed: 1,
    offered_price: '',
  });
  
  const [pickupSearch, setPickupSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');
  const [showStartSugg, setShowStartSugg] = useState(false);
  const [showDestSugg, setShowDestSugg] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.pickup_landmark_id || !formData.destination_landmark_id) {
        alert("Please select valid landmarks from the list");
        return;
      }
      await createPassengerRequest({
        ...formData,
        pickup_location: pickupSearch,
        destination: destSearch,
        offered_price: parseFloat(formData.offered_price),
        seats_needed: 1, // Specification says max 1
      });
      router.push('/rides');
    } catch (error) {
      console.error('Failed to create request:', error);
      alert('Failed to submit request. Please try again.');
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-primary overflow-x-hidden">
      <Navbar />
      
      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-80 h-80 bg-info/5 rounded-full blur-[120px] pointer-events-none" />
      
      <main className="max-w-md mx-auto px-4 pt-16 space-y-8 relative z-10">
        <header>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-info/10 rounded-2xl">
              <Users className="w-5 h-5 text-info" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-info bg-info/10 px-3 py-1.5 rounded-xl border border-info/20">Rider Section</span>
          </div>
          <h1 className="text-3xl font-black text-textPrimary tracking-tighter">Ride Request</h1>
          
          <div className="flex gap-2 mt-6 overflow-x-auto pb-2 no-scrollbar">
            <Link href="/rides" className="flex-none px-4 py-2 bg-surface text-[9px] font-black uppercase tracking-widest text-textSecondary rounded-xl border border-divider hover:border-info/40 transition-all">
              Find a Ride
            </Link>
            <button className="flex-none px-4 py-2 bg-info/10 text-[9px] font-black uppercase tracking-widest text-info rounded-xl border border-info/20 shadow-sm shadow-info/5">
              Schedule a Ride
            </button>
            <button className="flex-none px-4 py-2 bg-surface text-[9px] font-black uppercase tracking-widest text-textSecondary rounded-xl border border-divider hover:border-info/40 transition-all">
              Post Need Ride
            </button>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Routes Section */}
          <div className="glass-card p-8 shadow-lg border-divider space-y-6 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-info/5 rounded-bl-full pointer-events-none" />
            
            <div className="relative">
              <label className="text-[9px] font-black text-textSecondary uppercase tracking-[0.2em] mb-2 block ml-1">Current Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-info" />
                <input
                  type="text"
                  placeholder="Where are you?"
                  className="w-full pl-12 pr-4 py-5 bg-surface-elevated rounded-2xl border border-divider focus:ring-2 focus:ring-info/30 focus:border-info/40 outline-none transition-all font-bold text-textPrimary placeholder:text-textSecondary/30 text-sm"
                  value={pickupSearch}
                  onFocus={() => setShowStartSugg(true)}
                  onBlur={() => setTimeout(() => setShowStartSugg(false), 200)}
                  onChange={(e) => setPickupSearch(e.target.value)}
                  required
                />
              </div>
              {showStartSugg && (
                <div className="absolute z-50 left-0 right-0 mt-2 bg-surface-elevated shadow-2xl border border-divider overflow-hidden max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2 rounded-xl">
                  {landmarks?.filter(l => l.name.toLowerCase().includes(pickupSearch.toLowerCase())).map(land => (
                    <button 
                      key={land.id}
                      type="button"
                      onClick={() => {
                        setFormData({...formData, pickup_landmark_id: land.id});
                        setPickupSearch(land.name);
                      }}
                      className="w-full text-left px-5 py-4 hover:bg-info/20 text-xs font-bold text-textPrimary border-b border-divider/10 last:border-0 transition-colors uppercase tracking-widest"
                    >
                      {land.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
               <label className="text-[9px] font-black text-textSecondary uppercase tracking-[0.2em] mb-2 block ml-1">Where to?</label>
               <div className="relative">
                <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-info" />
                <input
                  type="text"
                  placeholder="Target Destination"
                  className="w-full pl-12 pr-4 py-5 bg-surface-elevated rounded-2xl border border-divider focus:ring-2 focus:ring-info/30 focus:border-info/40 outline-none transition-all font-bold text-textPrimary placeholder:text-textSecondary/30 text-sm"
                  value={destSearch}
                  onFocus={() => setShowDestSugg(true)}
                  onBlur={() => setTimeout(() => setShowDestSugg(false), 200)}
                  onChange={(e) => setDestSearch(e.target.value)}
                  required
                />
              </div>
              {showDestSugg && (
                <div className="absolute z-50 left-0 right-0 mt-2 bg-surface-elevated shadow-2xl border border-divider overflow-hidden max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2 rounded-xl">
                  {landmarks?.filter(l => l.name.toLowerCase().includes(destSearch.toLowerCase())).map(land => (
                    <button 
                      key={land.id}
                      type="button"
                      onClick={() => {
                        setFormData({...formData, destination_landmark_id: land.id});
                        setDestSearch(land.name);
                      }}
                      className="w-full text-left px-5 py-4 hover:bg-info/20 text-xs font-bold text-textPrimary border-b border-divider/10 last:border-0 transition-colors uppercase tracking-widest"
                    >
                      {land.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="glass-card p-8 shadow-lg border-divider grid grid-cols-2 gap-6 relative group overflow-hidden">
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-info/5 rounded-tl-full pointer-events-none" />
            
            <div className="col-span-2">
              <label className="text-[9px] font-black text-textSecondary uppercase tracking-[0.2em] mb-2 block ml-1">When?</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-info" />
                <input
                  type="datetime-local"
                  className="w-full pl-12 pr-4 py-5 bg-surface-elevated rounded-2xl border border-divider focus:ring-2 focus:ring-info/30 focus:border-info/40 outline-none transition-all font-bold text-textPrimary"
                  value={formData.departure_time}
                  onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black text-textSecondary uppercase tracking-[0.2em] mb-2 block ml-1">Seats Needed</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-info" />
                <input
                  type="number"
                  min="1"
                  max="1"
                  className="w-full pl-12 pr-4 py-5 bg-surface-elevated rounded-2xl border border-divider focus:ring-2 focus:ring-info/30 focus:border-info/40 outline-none transition-all font-bold text-textPrimary text-sm"
                  value={formData.seats_needed}
                  onChange={(e) => setFormData({ ...formData, seats_needed: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black text-textSecondary uppercase tracking-[0.2em] mb-2 block ml-1">Your Price</label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-info" />
                <input
                  type="number"
                  placeholder="₹"
                  className="w-full pl-12 py-5 bg-surface-elevated rounded-2xl border border-divider focus:ring-2 focus:ring-info/30 focus:border-info/40 outline-none transition-all font-bold text-textPrimary text-sm"
                  value={formData.offered_price}
                  onChange={(e) => setFormData({ ...formData, offered_price: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isCreatingPassengerRequest}
            className="w-full bg-info text-white rounded-2xl py-6 flex items-center justify-center gap-4 transition-all active:scale-95 disabled:grayscale disabled:opacity-30 shadow-xl shadow-info/20 group hover:bg-info/90"
          >
            <span className="text-xs uppercase font-black tracking-[0.5em] group-hover:tracking-[0.6em] transition-all">
              {isCreatingPassengerRequest ? 'Posting...' : 'Post My Request'}
            </span>
          </button>
          
          <div className="flex items-center justify-center gap-2 text-textSecondary text-[10px] font-black uppercase tracking-[0.3em] py-4 opacity-40">
            <Bike className="w-3.5 h-3.5" />
            2-Wheeler rides only • Drivers will contact you
          </div>
        </form>
      </main>
    </div>
  );
}
