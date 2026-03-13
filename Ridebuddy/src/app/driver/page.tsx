'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { 
  Car, ShieldCheck, TrendingUp, Save, ChevronLeft, 
  MapPin, Clock, IndianRupee, Shield
} from 'lucide-react';
import Link from 'next/link';

interface Vehicle {
  id?: string;
  vehicle_type: string;
  vehicle_model: string;
  vehicle_number: string;
  seat_capacity: number;
}

export default function DriverDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle>({
    vehicle_type: '',
    vehicle_model: '',
    vehicle_number: '',
    seat_capacity: 1,
  });
  const [license, setLicense] = useState('');
  const [lastRide, setLastRide] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      // 1. Fetch Vehicle
      supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setVehicle({
              id: data.id,
              vehicle_type: data.vehicle_type || '',
              vehicle_model: data.vehicle_model || '',
              vehicle_number: data.vehicle_number || '',
              seat_capacity: data.seat_capacity || 1,
            });
          }
        });

      // 1.1 Fetch Profile for license
      supabase
        .from('profiles')
        .select('license_number')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) setLicense(data.license_number || '');
        });

      // 2. Fetch Last Ride
      supabase
        .from('rides')
        .select('*')
        .eq('driver_id', user.id)
        .order('departure_time', { ascending: false })
        .limit(1)
        .single()
        .then(({ data }) => setLastRide(data));
    }
  }, [user, authLoading, router]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      let vehicleId = vehicle.id;
      if (vehicleId) {
        await supabase
          .from('vehicles')
          .update({
            vehicle_type: vehicle.vehicle_type,
            vehicle_model: vehicle.vehicle_model,
            vehicle_number: vehicle.vehicle_number,
            seat_capacity: vehicle.seat_capacity,
          })
          .eq('id', vehicleId);
      } else {
        const { data, error } = await supabase
          .from('vehicles')
          .insert([{
            user_id: user.id,
            vehicle_type: vehicle.vehicle_type,
            vehicle_model: vehicle.vehicle_model,
            vehicle_number: vehicle.vehicle_number,
            seat_capacity: vehicle.seat_capacity,
          }])
          .select()
          .single();
        
        if (data) {
          vehicleId = data.id;
          setVehicle(prev => ({ ...prev, id: data.id }));
        }
      }
      
      // Update license in profiles
      await supabase
        .from('profiles')
        .update({ license_number: license })
        .eq('id', user.id);

      alert('Asset Matrix Synchronized. Missions Unlocked.');
    } catch (error) {
      alert('Transmission Failed');
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
      <div className="fixed top-0 right-0 w-80 h-80 bg-success/5 rounded-full blur-[120px] pointer-events-none" />
      
      <main className="max-w-md mx-auto px-4 pt-16 space-y-8 relative z-10">
        <header className="flex flex-col gap-4">
          <Link href="/profile" className="flex items-center gap-2 text-textSecondary hover:text-accent transition-colors group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Matrix</span>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-textPrimary tracking-tighter">Driver Dashboard</h1>
            <p className="text-textSecondary text-[10px] font-black uppercase tracking-widest mt-2 leading-relaxed opacity-60">Operations & Asset Management</p>
          </div>
        </header>

        {/* REGISTRATION FLOW (IF NO VEHICLE) */}
        {!vehicle.id ? (
          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-warning/10 border border-warning/30 p-8 rounded-[2.5rem] flex flex-col gap-6 relative group overflow-hidden">
               <div className="absolute inset-0 bg-warning/5 opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="flex items-center gap-5 relative z-10">
                 <div className="w-14 h-14 bg-surface-elevated rounded-2xl flex items-center justify-center text-warning shadow-lg border border-divider group-hover:rotate-12 transition-transform">
                    <Shield className="w-8 h-8" />
                 </div>
                 <div className="flex-1">
                    <p className="text-warning font-black text-sm uppercase tracking-tight">Activation Required ⚠️</p>
                    <p className="text-textPrimary text-[10px] font-black uppercase tracking-widest mt-1 opacity-80 leading-relaxed">No asset detected in flight logs. Register your 2-wheeler below to unlock ride sharing missions.</p>
                 </div>
               </div>
            </div>

            <div className="glass-card p-8 shadow-2xl border-accent/30 space-y-8 bg-surface-elevated/40">
              <div className="flex items-center gap-3">
                <Car className="w-5 h-5 text-accent" />
                <h2 className="text-[11px] font-black text-textPrimary uppercase tracking-[0.4em]">Vehicle Registration Terminal</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-textSecondary uppercase tracking-[0.2em] mb-1.5 block ml-1">2-Wheeler Type</label>
                  <select
                    value={vehicle.vehicle_type}
                    onChange={e => setVehicle({ ...vehicle, vehicle_type: e.target.value })}
                    className="w-full px-5 py-5 bg-surface-elevated rounded-2xl border border-divider focus:ring-2 focus:ring-accent/30 outline-none font-bold text-textPrimary text-sm appearance-none cursor-pointer uppercase tracking-widest transition-all"
                  >
                    <option value="">Select type...</option>
                    <option value="bike">Bike</option>
                    <option value="scooter">Scooter</option>
                    <option value="motorcycle">Motorcycle</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-textSecondary uppercase tracking-[0.2em] mb-1.5 block ml-1">Vehicle Model</label>
                  <input 
                    type="text" 
                    value={vehicle.vehicle_model} 
                    onChange={e => setVehicle({ ...vehicle, vehicle_model: e.target.value })}
                    className="w-full px-5 py-5 bg-surface-elevated rounded-2xl border border-divider focus:ring-2 focus:ring-accent/30 outline-none font-bold text-textPrimary text-sm uppercase tracking-widest transition-all"
                    placeholder="e.g. Royal Enfield / Activa"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-textSecondary uppercase tracking-[0.2em] mb-1.5 block ml-1">Vehicle Plate #</label>
                  <input 
                    type="text" 
                    value={vehicle.vehicle_number} 
                    onChange={e => setVehicle({ ...vehicle, vehicle_number: e.target.value })}
                    className="w-full px-5 py-5 bg-surface-elevated rounded-2xl border border-divider focus:ring-2 focus:ring-accent/30 outline-none font-bold text-textPrimary text-sm uppercase tracking-widest transition-all"
                    placeholder="e.g. MH 12 AB 1234"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-textSecondary uppercase tracking-[0.2em] mb-1.5 block ml-1">Seat Capacity</label>
                  <input 
                    type="number" 
                    value={vehicle.seat_capacity} 
                    onChange={e => setVehicle({ ...vehicle, seat_capacity: parseInt(e.target.value) || 1 })}
                    className="w-full px-5 py-5 bg-surface-elevated rounded-2xl border border-divider focus:ring-2 focus:ring-accent/30 outline-none font-bold text-textPrimary text-sm transition-all"
                    min="1"
                    max="4"
                  />
                </div>
                <div className="space-y-2 group">
                  <label className="text-[9px] font-black text-textSecondary uppercase tracking-[0.2em] mb-1.5 block ml-1">Pilot License (Optional)</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent/40" />
                    <input 
                      type="text" 
                      value={license}
                      onChange={e => setLicense(e.target.value)}
                      placeholder="ENTER LICENSE DESIGNATION"
                      className="w-full pl-12 pr-4 py-5 bg-surface-elevated rounded-2xl border border-divider focus:ring-2 focus:ring-accent/30 outline-none font-bold text-textPrimary text-sm uppercase tracking-widest transition-all" 
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSave} 
                disabled={saving || !vehicle.vehicle_type || !vehicle.vehicle_model || !vehicle.vehicle_number}
                className="w-full py-6 bg-accent-burst text-white rounded-2xl flex items-center justify-center gap-4 transition-all font-black text-[11px] uppercase tracking-[0.4em] active:scale-[0.98] shadow-2xl shadow-accent/20 enabled:hover:bg-accent disabled:opacity-30"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Transmitting...' : 'Initiate Registration'}
              </button>
            </div>
          </section>
        ) : (
          /* ACTIVE DASHBOARD (IF REGISTERED) */
          <div className="space-y-8 animate-in fade-in duration-700">
            {/* Action Center */}
            <div className="grid grid-cols-1 gap-4">
              <Link href="/create-ride" className="glass-card p-6 bg-accent-burst text-white flex items-center justify-between group shadow-xl shadow-accent/20 border-accent overflow-hidden relative active:scale-95 transition-all">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black uppercase tracking-widest">Post a New Ride</span>
                    <span className="text-[9px] font-bold opacity-70 uppercase tracking-widest">Deploy a new mission v2.0</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Last Ride Card */}
            <section className="space-y-4">
              <h2 className="text-[10px] font-black text-textPrimary uppercase tracking-[0.3em] flex items-center gap-2 ml-1">
                 <Clock className="w-3.5 h-3.5 text-accent" /> Recent Mission
              </h2>
              <div className="glass-card p-6 border-divider">
                {lastRide ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <div className="flex flex-col">
                          <span className="text-[9px] font-black text-textSecondary uppercase tracking-widest leading-none mb-1">Status</span>
                          <span className="text-xs font-black text-success uppercase tracking-wider">{lastRide.status}</span>
                       </div>
                       <div className="text-right">
                          <span className="text-[9px] font-black text-textSecondary uppercase tracking-widest leading-none mb-1">Earnings</span>
                          <p className="text-lg font-black text-textPrimary leading-none">₹{lastRide.price}</p>
                       </div>
                    </div>
                    <div className="space-y-4 pt-4 border-t border-divider">
                      <div className="flex items-start gap-4">
                        <div className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />
                        <div>
                          <p className="text-[9px] font-black text-textSecondary uppercase tracking-widest mb-0.5 opacity-60">Extraction Point</p>
                          <p className="text-sm font-bold text-textPrimary leading-tight">{lastRide.pickup_location}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-2 h-2 rounded-full bg-success mt-1.5 shrink-0" />
                        <div>
                          <p className="text-[9px] font-black text-textSecondary uppercase tracking-widest mb-0.5 opacity-60">Insertion Vector</p>
                          <p className="text-sm font-bold text-textPrimary leading-tight">{lastRide.destination}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center space-y-3">
                    <div className="w-12 h-12 bg-surface-elevated rounded-2xl flex items-center justify-center mx-auto opacity-40">
                      <Clock className="w-6 h-6 text-textSecondary" />
                    </div>
                    <p className="text-xs font-bold text-textSecondary uppercase tracking-widest">No mission logs detected</p>
                  </div>
                )}
              </div>
            </section>

            {/* Asset Metrics (Update Only) */}
            <section className="space-y-4 pt-4">
              <h2 className="text-[10px] font-black text-textPrimary uppercase tracking-[0.3em] flex items-center gap-2 ml-1">
                 <ShieldCheck className="w-3.5 h-3.5 text-success" /> Asset Metrics
              </h2>
              <div id="asset-metrics" className="glass-card p-8 shadow-lg border-divider space-y-8 bg-surface-elevated/20">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-textSecondary uppercase tracking-[0.2em] mb-1.5 block ml-1">2-Wheeler Type</label>
                    <select
                      value={vehicle.vehicle_type}
                      onChange={e => setVehicle({ ...vehicle, vehicle_type: e.target.value })}
                      className="w-full px-5 py-4 bg-surface-elevated rounded-2xl border border-divider focus:ring-2 focus:ring-success/30 outline-none font-bold text-textPrimary text-sm appearance-none cursor-pointer uppercase tracking-widest transition-all"
                    >
                      <option value="">Select type...</option>
                      <option value="bike">Bike</option>
                      <option value="scooter">Scooter</option>
                      <option value="motorcycle">Motorcycle</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-textSecondary uppercase tracking-[0.2em] mb-1.5 block ml-1">Vehicle Model</label>
                    <input 
                      type="text" 
                      value={vehicle.vehicle_model} 
                      onChange={e => setVehicle({ ...vehicle, vehicle_model: e.target.value })}
                      className="w-full px-5 py-4 bg-surface-elevated rounded-2xl border border-divider focus:ring-2 focus:ring-success/30 outline-none font-bold text-textPrimary text-sm uppercase tracking-widest transition-all"
                      placeholder="e.g. Royal Enfield"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-textSecondary uppercase tracking-[0.2em] mb-1.5 block ml-1">Vehicle Plate #</label>
                    <input 
                      type="text" 
                      value={vehicle.vehicle_number} 
                      onChange={e => setVehicle({ ...vehicle, vehicle_number: e.target.value })}
                      className="w-full px-5 py-4 bg-surface-elevated rounded-2xl border border-divider focus:ring-2 focus:ring-success/30 outline-none font-bold text-textPrimary text-sm uppercase tracking-widest transition-all"
                      placeholder="e.g. MH 12 AB 1234"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-textSecondary uppercase tracking-[0.2em] mb-1.5 block ml-1">Seat Capacity</label>
                    <input 
                      type="number" 
                      value={vehicle.seat_capacity} 
                      onChange={e => setVehicle({ ...vehicle, seat_capacity: parseInt(e.target.value) || 1 })}
                      className="w-full px-5 py-4 bg-surface-elevated rounded-2xl border border-divider focus:ring-2 focus:ring-success/30 outline-none font-bold text-textPrimary text-sm transition-all"
                      min="1"
                      max="4"
                    />
                  </div>
                  <div className="space-y-2 group">
                    <label className="text-[9px] font-black text-textSecondary uppercase tracking-[0.2em] mb-1.5 block ml-1">Pilot License (Optional)</label>
                    <div className="relative">
                      <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-success/40" />
                      <input 
                        type="text" 
                        value={license}
                        onChange={e => setLicense(e.target.value)}
                        placeholder="ENTER LICENSE DESIGNATION"
                        className="w-full pl-12 pr-4 py-4 bg-surface-elevated rounded-2xl border border-divider focus:ring-2 focus:ring-success/30 outline-none font-bold text-textPrimary text-sm uppercase tracking-widest transition-all" 
                      />
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="w-full py-6 mt-6 bg-success text-white rounded-2xl flex items-center justify-center gap-4 transition-all font-black text-[10px] uppercase tracking-[0.4em] active:scale-[0.98] shadow-lg shadow-success/20 hover:bg-success/90"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Synchronizing...' : 'Update Asset Data'}
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
