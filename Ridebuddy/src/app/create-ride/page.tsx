'use client';

import { useState, useEffect } from 'react';
import { useRides } from '@/hooks/useRides';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import { MapPin, Calendar, Users, IndianRupee, Bike, Sparkles, Leaf, Info, Navigation, Clock } from 'lucide-react';

const CAMPUS_LANDMARKS = [
  'Main Gate', 'Hostel Block A', 'Hostel Block B', 'Library', 
  'Tech Park', 'Management Block', 'Sports Complex', 'Admin Building',
  'Canteen', 'Cafeteria', 'Auditorium', 'Science Lab'
];

export default function CreateRide() {
  const { createRide, isCreating, landmarks, isLoadingLandmarks } = useRides();
  const router = useRouter();

  const [formData, setFormData] = useState({
    pickup_landmark_id: '',
    destination_landmark_id: '',
    departure_time: '',
    seat_available: 1,
    fare: '',
    vehicle_type: '',
  });

  const [pickupSearch, setPickupSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');
  const [showStartSugg, setShowStartSugg] = useState(false);
  const [showDestSugg, setShowDestSugg] = useState(false);
  const [efficiency, setEfficiency] = useState(0);

  // Mock efficiency calculation
  useEffect(() => {
    if (formData.pickup_landmark_id && formData.destination_landmark_id) {
      setEfficiency(1.2); 
    } else {
      setEfficiency(0);
    }
  }, [formData.pickup_landmark_id, formData.destination_landmark_id]);

  const suggestFare = () => {
    if (!formData.pickup_landmark_id || !formData.destination_landmark_id) {
      alert("Please select landmarks first");
      return;
    }
    const randomFare = Math.floor(Math.random() * 40) + 10;
    setFormData({ ...formData, fare: randomFare.toString() });
  };

  const [hasVehicle, setHasVehicle] = useState<boolean | null>(null);

  useEffect(() => {
    const checkVehicle = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('vehicles')
          .select('id')
          .eq('user_id', user.id)
          .single();
        setHasVehicle(!!data);
      }
    };
    checkVehicle();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Please login first");
        return;
      }

      // 1. Fetch Vehicle reliably
      const { data: vehicle, error: vError } = await supabase
        .from('vehicles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (vError || !vehicle) {
        alert('Mission Aborted: No asset detected in your profile. Please register your vehicle in the Driver Dashboard.');
        router.push('/driver');
        return;
      }

      // 2. Validate Fare
      const fareValue = parseFloat(formData.fare);
      if (isNaN(fareValue)) {
        alert('Invalid fare amount');
        return;
      }

      // 3. Prepare Data (handle empty UUID strings)
      const submissionData = {
        pickup_location: pickupSearch,
        destination: destSearch,
        departure_time: formData.departure_time,
        vehicle_type: formData.vehicle_type,
        seat_available: formData.seat_available,
        price: fareValue,
        fare: fareValue,
        vehicle_id: vehicle.id,
        pickup_landmark_id: formData.pickup_landmark_id || null,
        destination_landmark_id: formData.destination_landmark_id || null,
      };

      await createRide(submissionData);
      router.push('/rides');
    } catch (error) {
      console.error('Failed to create ride:', error);
      alert('Failed to post route. Sync Error detected.');
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-primary overflow-x-hidden">
      <Navbar />
      
      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-80 h-80 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      
      <main className="max-w-md mx-auto px-4 pt-16 space-y-8 relative z-10">
        <header>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-accent/10 rounded-2xl">
              <Bike className="w-5 h-5 text-accent" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-accent bg-accent/10 px-3 py-1.5 rounded-xl border border-accent/20">Driver Section</span>
          </div>
          <h1 className="text-3xl font-black text-textPrimary tracking-tighter">Post Your Route</h1>
          <p className="text-textSecondary text-xs font-bold uppercase tracking-widest mt-2 leading-relaxed opacity-60">Share your 2-wheeler ride with nearby riders</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Routes Section */}
          <div className="glass-card p-8 shadow-lg border-divider space-y-6 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-bl-full pointer-events-none" />
            
            <div className="relative">
              <label className="text-[9px] font-black text-textSecondary uppercase tracking-[0.2em] mb-2 block ml-1">Pickup Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                <input
                  type="text"
                  placeholder="Starting Coordinates"
                  className="w-full pl-12 pr-4 py-5 bg-surface-elevated rounded-2xl border border-divider focus:ring-2 focus:ring-accent/30 focus:border-accent/40 outline-none transition-all font-bold text-textPrimary placeholder:text-textSecondary/30 text-sm"
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
                      className="w-full text-left px-5 py-4 hover:bg-accent/20 text-xs font-bold text-textPrimary border-b border-divider/10 last:border-0 transition-colors uppercase tracking-widest"
                    >
                      {land.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
               <label className="text-[9px] font-black text-textSecondary uppercase tracking-[0.2em] mb-2 block ml-1">Destination</label>
               <div className="relative">
                <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                <input
                  type="text"
                  placeholder="Target Destination"
                  className="w-full pl-12 pr-4 py-5 bg-surface-elevated rounded-2xl border border-divider focus:ring-2 focus:ring-accent/30 focus:border-accent/40 outline-none transition-all font-bold text-textPrimary placeholder:text-textSecondary/30 text-sm"
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
                      className="w-full text-left px-5 py-4 hover:bg-accent/20 text-xs font-bold text-textPrimary border-b border-divider/10 last:border-0 transition-colors uppercase tracking-widest"
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
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-accent/5 rounded-tl-full pointer-events-none" />
            
            <div className="col-span-2">
              <label className="text-[9px] font-black text-textSecondary uppercase tracking-[0.2em] mb-2 block ml-1">Departure Time</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                <input
                  type="datetime-local"
                  className="w-full pl-12 pr-4 py-5 bg-surface-elevated rounded-2xl border border-divider focus:ring-2 focus:ring-accent/30 focus:border-accent/40 outline-none transition-all font-bold text-textPrimary"
                  value={formData.departure_time}
                  onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="text-[9px] font-black text-textSecondary uppercase tracking-[0.2em] mb-2 block ml-1">2-Wheeler Type</label>
              <div className="relative">
                <Bike className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent pointer-events-none" />
                <select
                  className="w-full pl-12 pr-4 py-5 bg-surface-elevated rounded-2xl border border-divider focus:ring-2 focus:ring-accent/30 focus:border-accent/40 outline-none transition-all font-bold text-textPrimary text-sm appearance-none cursor-pointer"
                  value={formData.vehicle_type}
                  onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                  required
                >
                  <option value="">Select vehicle...</option>
                  <option value="Bike">Bike</option>
                  <option value="Scooter">Scooter</option>
                  <option value="Activa">Activa</option>
                  <option value="Bullet">Bullet</option>
                  <option value="Motorcycle">Motorcycle</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black text-textSecondary uppercase tracking-[0.2em] mb-2 block ml-1">Pillion Seat</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                <input
                  type="number"
                  min="1"
                  max="1"
                  className="w-full pl-12 pr-4 py-5 bg-surface-elevated rounded-2xl border border-divider focus:ring-2 focus:ring-accent/30 focus:border-accent/40 outline-none transition-all font-bold text-textPrimary text-sm"
                  value={formData.seat_available}
                  onChange={(e) => setFormData({ ...formData, seat_available: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black text-textSecondary uppercase tracking-[0.2em] mb-2 block ml-1">Fare (₹)</label>
              <div className="relative">
                <button 
                  type="button" 
                  onClick={suggestFare}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-accent/10 text-accent p-2 rounded-xl hover:bg-accent/20 transition-all active:scale-90"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                <input
                  type="number"
                  placeholder="₹"
                  className="w-full pl-12 pr-12 py-5 bg-surface-elevated rounded-2xl border border-divider focus:ring-2 focus:ring-accent/30 focus:border-accent/40 outline-none transition-all font-bold text-textPrimary text-sm"
                  value={formData.fare}
                  onChange={(e) => setFormData({ ...formData, fare: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Efficiency & Impact */}
          {efficiency > 0 && (
            <div className="bg-success/5 border border-success/20 p-6 rounded-[2.5rem] flex items-center gap-5 animate-in slide-in-from-bottom-2 duration-500 overflow-hidden relative group">
              <div className="absolute inset-0 bg-success/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-12 h-12 bg-surface-elevated rounded-2xl flex items-center justify-center text-success shadow-sm border border-divider group-hover:rotate-12 transition-transform relative z-10">
                <Leaf className="w-6 h-6" />
              </div>
              <div className="flex-1 relative z-10">
                <p className="text-textPrimary font-black text-xs uppercase tracking-tight">Eco Protocol Active 🌱</p>
                <p className="text-success text-[10px] font-black uppercase tracking-widest mt-1 opacity-80">This session reduces ~{efficiency}kg Payload CO2</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isCreating}
            className="w-full btn-primary py-6 flex items-center justify-center gap-4 transition-all active:scale-95 disabled:grayscale disabled:opacity-30 shadow-xl shadow-accent/20 group"
          >
            <span className="text-xs uppercase font-black tracking-[0.5em] group-hover:tracking-[0.6em] transition-all">
              {isCreating ? 'Posting...' : 'Post Ride'}
            </span>
          </button>
          
          <div className="flex items-center justify-center gap-2 text-textSecondary text-[10px] font-black uppercase tracking-[0.3em] py-4 opacity-40">
            <Bike className="w-3.5 h-3.5" />
            2-Wheeler Rides Only
          </div>
        </form>
      </main>
    </div>
  );
}

// Reuse Navigation icon from lucide-react (imported at top)
