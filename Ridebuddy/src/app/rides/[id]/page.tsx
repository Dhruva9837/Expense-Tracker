'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useRides } from '@/hooks/useRides';
import Navbar from '@/components/layout/Navbar';
import MapView from '@/components/maps/MapView';
import RatingModal from '@/components/rides/RatingModal';
import { 
  MapPin, Calendar, Users, IndianRupee, Bike, ArrowLeft, 
  CheckCircle2, XCircle, Clock, ShieldAlert, Navigation, 
  CreditCard, Star, ShieldCheck, Leaf, Info 
} from 'lucide-react';
import { format } from 'date-fns';
import { sosService } from '@/services/sosService';

interface RideDetail {
  id: string;
  pickup_location: string;
  destination: string;
  departure_time: string;
  available_seats: number;
  price: number;
  vehicle_type: string;
  status: string;
  driver_id: string;
  driver: { name: string; avatar_url?: string };
  trust_score?: number;
  efficiency_score?: number;
}

interface RideRequest {
  id: string;
  status: string;
  passenger: { name: string; avatar_url?: string };
}

export default function RideDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { requestRide, isRequesting, updateRequestStatus, submitRating } = useRides();
  const router = useRouter();
  const [ride, setRide] = useState<RideDetail | null>(null);
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasRequested, setHasRequested] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string>('');
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [isRated, setIsRated] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | null>(null);

  useEffect(() => {
    async function fetchRide() {
      const { data, error } = await supabase
        .from('rides')
        .select('*, driver:profiles(name, avatar_url)')
        .eq('id', id)
        .single();

      if (!error && data) {
        // Mock trust/efficiency if not present in DB
        setRide({
          ...data,
          trust_score: 98,
          efficiency_score: 1.2
        });
      }

      // Check if user already requested
      if (user) {
        const { data: existingReq } = await supabase
          .from('ride_requests')
          .select('id, status')
          .eq('ride_id', id)
          .eq('passenger_id', user.id)
          .maybeSingle();
        if (existingReq) {
          setHasRequested(true);
          setRequestStatus(existingReq.status);
        }

        // Check if already paid/rated
        const { data: payment } = await supabase.from('payments').select('id').eq('ride_id', id).eq('passenger_id', user.id).maybeSingle();
        if (payment) setIsPaid(true);
        
        const { data: rating } = await supabase.from('ratings').select('id').eq('ride_id', id).eq('passenger_id', user.id).maybeSingle();
        if (rating) setIsRated(true);
      }

      // Fetch requests if driver
      if (user && data?.driver_id === user.id) {
        const { data: reqs } = await supabase
          .from('ride_requests')
          .select('*, passenger:profiles(name, avatar_url)')
          .eq('ride_id', id);
        if (reqs) setRequests(reqs);
      }

      setLoading(false);
    }
    fetchRide();
  }, [id, user]);

  const handleRequest = async () => {
    try {
      await requestRide(id as string);
      setHasRequested(true);
      setRequestStatus('pending');
    } catch (err) {
      alert('Failed to send request.');
    }
  };

  const handleUpdateRequest = async (requestId: string, status: string) => {
    try {
      await updateRequestStatus({ requestId, status });
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
    } catch (err) {
      alert('Failed to update request.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <Info className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 font-bold">Ride not found.</p>
          <button onClick={() => router.push('/rides')} className="mt-4 text-blue-600 font-black uppercase tracking-widest text-xs">Explore Rides</button>
        </div>
      </div>
    );
  }

  const isDriver = user?.id === ride.driver_id;

  return (
    <div className="min-h-screen pb-24 bg-primary overflow-x-hidden">
      <Navbar />
      
      {/* Background Decorative Elements */}
      <div className="fixed top-0 right-0 w-72 h-72 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
      
      <main className="max-w-md mx-auto px-4 pt-16 space-y-8 relative z-10">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="w-10 h-10 glass-card flex items-center justify-center text-textSecondary hover:text-accent transition-all active:scale-95 border-divider">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xs font-black text-textPrimary uppercase tracking-[0.3em] text-center ml-2">Manifest</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        <div className="glass-card shadow-lg border-divider overflow-hidden relative group">
          {/* Status Badge */}
          <div className="absolute top-6 right-6 z-30">
             <span className={`px-4 py-2 rounded-xl text-[9px] uppercase font-black tracking-widest shadow-xl border ${
                ride.status === 'completed' ? 'bg-success/20 text-success border-success/30' : 
                ride.status === 'active' ? 'bg-accent/20 text-accent border-accent/30' : 'bg-surface-elevated text-textPrimary border-divider'
              }`}>
                {ride.status}
              </span>
          </div>

          {/* Map Header */}
          <div className="h-48 relative overflow-hidden">
            <MapView 
               startLocation={ride.pickup_location} 
               destination={ride.destination} 
               isActive={ride.status === 'active' || (ride.status === 'pending' && requestStatus === 'accepted')} 
            />
            <div className="absolute inset-0 bg-map-overlay pointer-events-none" />
          </div>

          <div className="p-6 pt-0 relative z-20 space-y-8">
            {/* Driver Info Card */}
            <div className="bg-surface p-5 rounded-3xl border border-divider flex items-center gap-4 -mt-10 shadow-lg group-hover:border-accent/30 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-accent-burst flex items-center justify-center text-white text-xl font-black border-2 border-primary shadow-xl">
                {ride.driver.name[0]}
              </div>
              <div className="flex-1">
                <h2 className="font-black text-textPrimary leading-tight tracking-tight">{ride.driver.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-1 text-[9px] bg-warning/10 text-warning px-2 py-0.5 rounded-full font-black uppercase border border-warning/20">
                    <Star className="w-2.5 h-2.5 fill-warning" /> 4.9
                  </span>
                  <span className="flex items-center gap-1 text-[9px] bg-success/10 text-success px-2 py-0.5 rounded-full font-black uppercase border border-success/20">
                    <ShieldCheck className="w-2.5 h-2.5" /> {ride.trust_score}% Trust
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-textSecondary font-black uppercase mb-0.5">Asset</p>
                <div className="flex items-center gap-1 text-textPrimary font-black text-[10px] uppercase">
                  <Bike className="w-3.5 h-3.5 text-accent" />
                  {ride.vehicle_type}
                </div>
              </div>
            </div>

            {/* Route Details */}
            <div className="space-y-6 px-2">
              <div className="flex items-start gap-5">
                <div className="flex flex-col items-center gap-1 mt-1.5">
                  <div className="w-3 h-3 rounded-full bg-accent shadow-[0_0_10px_rgba(233,69,96,0.6)]" />
                  <div className="w-[1px] h-12 bg-gradient-to-b from-accent/50 to-divider" />
                  <div className="w-3 h-3 rounded-sm bg-textSecondary" />
                </div>
                <div className="flex-1 space-y-6">
                  <div>
                    <label className="text-[9px] font-black text-textSecondary uppercase tracking-widest mb-1.5 block">Launch Point</label>
                    <p className="font-black text-textPrimary text-lg leading-tight tracking-tight">{ride.pickup_location}</p>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-textSecondary uppercase tracking-widest mb-1.5 block">Final Terminal</label>
                    <p className="font-black text-textPrimary text-lg leading-tight tracking-tight">{ride.destination}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-surface p-4 rounded-2xl text-center border border-divider">
                <Clock className="w-4 h-4 text-accent mx-auto mb-1.5" />
                <p className="font-black text-textPrimary text-sm leading-none" suppressHydrationWarning>{format(new Date(ride.departure_time), 'h:mm a')}</p>
                <p className="text-[8px] font-black text-textSecondary uppercase tracking-widest mt-1.5">Schedule</p>
              </div>
              <div className="bg-surface p-4 rounded-2xl text-center border border-divider">
                <Users className="w-4 h-4 text-accent mx-auto mb-1.5" />
                <p className="font-black text-textPrimary text-sm leading-none">{ride.available_seats}</p>
                <p className="text-[8px] font-black text-textSecondary uppercase tracking-widest mt-1.5">Slots</p>
              </div>
              <div className="bg-accent-burst p-4 rounded-2xl text-center shadow-lg shadow-accent/20">
                <IndianRupee className="w-4 h-4 text-white mx-auto mb-1.5" />
                <p className="font-black text-white text-sm leading-none">₹{ride.price}</p>
                <p className="text-[8px] font-black text-white/60 uppercase tracking-widest mt-1.5">Fare</p>
              </div>
            </div>

            {/* Efficiency Badge */}
            <div className="bg-success/5 border border-success/20 p-5 rounded-3xl flex items-center gap-4">
              <div className="w-12 h-12 bg-surface-elevated rounded-2xl flex items-center justify-center text-success shadow-sm border border-divider transition-transform hover:rotate-6">
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <p className="text-textPrimary font-black text-xs uppercase tracking-tight">Eco Contribution</p>
                <p className="text-success text-[10px] font-bold uppercase tracking-widest mt-1">Saves ~{ride.efficiency_score}kg CO2 Shift</p>
              </div>
            </div>

            {/* Dynamic Actions */}
            <div className="pt-4">
              {!user ? (
                <button 
                  onClick={() => router.push('/login')} 
                  className="w-full btn-primary uppercase tracking-widest text-xs py-5"
                >
                  Join the Mission
                </button>
              ) : isDriver ? (
                <div className="space-y-8">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-[10px] font-black text-textPrimary uppercase tracking-[0.3em]">Boarding List</h3>
                    <div className="flex gap-2">
                    {ride.status === 'pending' && (
                      <button 
                        onClick={async () => {
                          const { error } = await supabase.from('rides').update({ status: 'active' }).eq('id', ride.id);
                          if (!error) setRide({ ...ride, status: 'active' });
                        }}
                        className="px-4 py-2 bg-accent text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-accent/20 active:scale-95 transition-all"
                      >
                        Launch
                      </button>
                    )}
                    {ride.status === 'active' && (
                      <button 
                        onClick={async () => {
                          const { error } = await supabase.from('rides').update({ status: 'completed' }).eq('id', ride.id);
                          if (!error) setRide({ ...ride, status: 'completed' });
                        }}
                        className="px-4 py-2 bg-success text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-success/20 active:scale-95 transition-all"
                      >
                        Complete
                      </button>
                    )}
                    </div>
                  </div>
                  
                  {requests.length === 0 ? (
                    <div className="text-center py-12 glass-card border-divider border-dashed">
                      <Users className="w-10 h-10 text-textSecondary/20 mx-auto mb-3" />
                      <p className="text-textSecondary text-[10px] font-black uppercase tracking-[0.2em]">Silence on Deck</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {requests.map(req => (
                        <div key={req.id} className="flex items-center justify-between glass-card p-4 hover:border-accent/30 transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-surface-elevated flex items-center justify-center text-accent font-black border border-divider group-hover:border-accent/30 transition-colors">
                              {req.passenger.name[0]}
                            </div>
                            <div>
                              <p className="font-black text-textPrimary text-sm leading-tight tracking-tight">{req.passenger.name}</p>
                              <span className={`text-[9px] font-black uppercase tracking-widest mt-0.5 flex items-center gap-1 ${
                                req.status === 'accepted' ? 'text-success' :
                                req.status === 'rejected' ? 'text-error' : 'text-warning'
                              }`}>
                                <div className={`w-1 h-1 rounded-full ${
                                  req.status === 'accepted' ? 'bg-success' :
                                  req.status === 'rejected' ? 'bg-error' : 'bg-warning'
                                } animate-pulse`} />
                                {req.status}
                              </span>
                            </div>
                          </div>
                          {req.status === 'pending' && ride.status === 'pending' && (
                            <div className="flex gap-2">
                              <button onClick={() => handleUpdateRequest(req.id, 'accepted')} className="w-10 h-10 bg-success text-white rounded-xl flex items-center justify-center shadow-lg shadow-success/20 active:scale-90 transition-all">
                                <CheckCircle2 className="w-5 h-5" />
                              </button>
                              <button onClick={() => handleUpdateRequest(req.id, 'rejected')} className="w-10 h-10 bg-error/10 text-error rounded-xl flex items-center justify-center border border-error/30 active:scale-90 transition-all">
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : hasRequested ? (
                <div className="space-y-8">
                  {/* Request Status Info */}
                  <div className={`p-8 rounded-[2rem] border text-center relative overflow-hidden group ${
                    requestStatus === 'accepted' ? 'bg-success/5 border-success/30' : 
                    requestStatus === 'rejected' ? 'bg-error/5 border-error/30' : 'bg-warning/5 border-warning/30'
                   }`}>
                    <div className={`absolute top-0 right-0 w-24 h-24 opacity-10 rounded-bl-full -mr-8 -mt-8 ${
                      requestStatus === 'accepted' ? 'bg-success' : requestStatus === 'rejected' ? 'bg-error' : 'bg-warning'
                    }`} />
                    
                    {requestStatus === 'accepted' ? (
                      <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                    ) : requestStatus === 'rejected' ? (
                      <XCircle className="w-12 h-12 text-error mx-auto mb-4 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                    ) : (
                      <Clock className="w-12 h-12 text-warning mx-auto mb-4 animate-pulse drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                    )}
                    <h4 className="font-black text-textPrimary uppercase tracking-[0.3em] mb-2">
                      {requestStatus === 'accepted' ? 'Confirmed' : requestStatus === 'rejected' ? 'Declined' : 'Awaiting'}
                    </h4>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${
                      requestStatus === 'accepted' ? 'text-success' : requestStatus === 'rejected' ? 'text-error' : 'text-warning'
                    }`}>
                      {requestStatus === 'accepted' ? 'Secure your seat' : requestStatus === 'rejected' ? 'Search new trail' : 'Driver reviewing credentials'}
                    </p>
                  </div>

                  {ride.status === 'completed' && requestStatus === 'accepted' && (
                    <div className="glass-card p-8 rounded-[2.5rem] shadow-xl space-y-6 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-accent/20" />
                      <div className="flex items-center justify-between">
                         <h4 className="font-black text-textPrimary uppercase tracking-widest text-xs">Settlement</h4>
                         <span className="text-2xl font-black text-accent tracking-tighter">₹{ride.price}</span>
                      </div>
                      
                      {!isPaid ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <button 
                              onClick={() => setPaymentMode('cash')}
                              className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                paymentMode === 'cash' ? 'bg-accent/10 border-accent text-accent' : 'bg-surface border-divider text-textSecondary'
                              }`}
                            >
                              Cash
                            </button>
                            <button 
                              onClick={() => setPaymentMode('upi')}
                              className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                paymentMode === 'upi' ? 'bg-accent/10 border-accent text-accent' : 'bg-surface border-divider text-textSecondary'
                              }`}
                            >
                              UPI
                            </button>
                          </div>
                          
                          <button 
                            onClick={async () => {
                              if (!paymentMode) {
                                alert("Please select a payment mode first");
                                return;
                              }
                              const { error } = await supabase.from('payments').insert([{ 
                                ride_id: ride.id, 
                                passenger_id: user.id, 
                                amount: ride.price, 
                                status: 'completed',
                                payment_method: paymentMode // Assuming this column exists or will be handled
                              }]);
                              if (!error) {
                                setIsPaid(true);
                                alert(`Payment via ${paymentMode.toUpperCase()} successful`);
                                setIsRatingModalOpen(true);
                              }
                            }}
                            className="w-full btn-primary flex items-center justify-center gap-3 py-5 text-xs uppercase tracking-widest shadow-accent/20"
                          >
                            <CreditCard className="w-5 h-5" /> Execute Payment
                          </button>
                        </div>
                      ) : !isRated ? (
                        <button 
                          onClick={() => setIsRatingModalOpen(true)}
                          className="w-full bg-warning text-white font-black py-5 rounded-2xl shadow-lg shadow-warning/20 flex items-center justify-center gap-3 uppercase tracking-widest text-xs active:scale-95 transition-all"
                        >
                          <Star className="w-5 h-5 fill-white" /> Rank Driver
                        </button>
                      ) : (
                        <div className="w-full py-5 bg-success/10 text-success rounded-2xl border border-success/30 font-black text-center uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-sm">
                          <CheckCircle2 className="w-4 h-4" /> Transaction Complete
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* SOS Button */}
                  <div className="bg-error/5 border border-error/20 p-8 rounded-[2.5rem] space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-error/30" />
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-surface-elevated rounded-2xl flex items-center justify-center text-error shadow-sm border border-divider group-hover:border-error/30 transition-all">
                        <ShieldAlert className="w-8 h-8 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="font-black text-textPrimary uppercase tracking-[0.2em] text-[10px]">Emergency SOS</h4>
                        <p className="text-error text-[10px] font-black uppercase tracking-widest mt-1 opacity-60">High Priority Signal</p>
                      </div>
                    </div>
                    <button 
                      onClick={async () => {
                        if (confirm("Send emergency SOS alert to campus security?")) {
                          try {
                            await sosService.triggerSOS(`Ride: ${ride.id} - ${ride.pickup_location} to ${ride.destination}`, ride.id);
                            alert("Emergency signal sent to University Security. Stay calm, help is on the way.");
                          } catch (err) {
                            alert("Failed to send SOS. Please call security directly.");
                          }
                        }
                      }}
                      className="w-full bg-error text-white font-black py-5 rounded-2xl uppercase tracking-widest text-[10px] shadow-xl shadow-error/20 active:scale-95 transition-all outline outline-offset-4 outline-transparent hover:outline-error/30"
                    >
                      Trigger Security
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleRequest}
                  disabled={isRequesting || ride.available_seats <= 0}
                  className="w-full btn-primary py-6 shadow-xl shadow-accent/20 disabled:grayscale disabled:opacity-50 text-[10px] uppercase tracking-[0.4em] active:scale-95 transition-all"
                >
                  {isRequesting ? 'Deploying...' : ride.available_seats <= 0 ? 'Full Load' : 'Request Connection'}
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-3 text-textSecondary text-[10px] font-black uppercase tracking-[0.3em] py-8 opacity-40">
          <ShieldCheck className="w-4 h-4" />
          Protocol Verified
        </div>
      </main>

      <RatingModal 
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        driverName={ride.driver.name}
        onSubmit={async (rating: number, review: string) => {
          try {
            await submitRating({ rideId: ride.id, driverId: ride.driver_id, rating, review });
            setIsRated(true);
            alert("Thank you for your feedback!");
          } catch (err) {
            alert("Failed to submit rating.");
          }
        }}
      />
    </div>
  );
}
