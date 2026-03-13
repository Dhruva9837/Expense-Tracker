'use client';

import { MapPin, Calendar, Users, IndianRupee, Bike, ChevronRight, Star, ShieldCheck, Leaf, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface RideCardProps {
  ride: {
    id: string;
    pickup_landmark?: { name: string };
    destination_landmark?: { name: string };
    departure_time: string;
    seat_available: number;
    fare: number;
    vehicle_type: string;
    driver: {
      full_name: string;
      avatar_url?: string;
    };
    trust_score?: number;
    efficiency_score?: number;
  };
  onClick?: () => void;
  isRecommended?: boolean;
}

export default function RideCard({ ride, onClick, isRecommended }: RideCardProps) {
  const trustScore = ride.trust_score || 98;
  const co2Saved = ride.efficiency_score || "1.2"; // Use a stable default instead of Math.random() during render

  const departureDate = new Date(ride.departure_time);
  const arrivalDate = new Date(departureDate.getTime() + 20 * 60000); // 20 mins campus ride estimate

  return (
    <div 
      onClick={onClick}
      className={`glass-card p-5 shadow-sm hover:shadow-lg hover:border-accent/30 transition-all cursor-pointer group relative overflow-hidden ${
        isRecommended ? 'ring-2 ring-accent shadow-accent/20' : ''
      }`}
    >
      {isRecommended && (
        <div className="absolute top-0 right-0 bg-accent text-white text-[10px] font-black px-3 py-1 rounded-bl-2xl uppercase tracking-widest z-10 shadow-lg">
          Recommended
        </div>
      )}
      
      <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-surface-elevated flex items-center justify-center text-accent font-bold text-xl border border-divider">
            {ride.driver.full_name?.[0] || 'U'}
          </div>
          <div>
            <h4 className="font-bold text-textPrimary group-hover:text-accent transition-colors">{ride.driver.full_name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1 text-[10px] bg-warning/10 text-warning px-2 py-0.5 rounded-full font-bold border border-warning/20">
                <Star className="w-3 h-3 fill-warning" /> 4.9
              </span>
              <span className="flex items-center gap-1 text-[10px] bg-success/10 text-success px-2 py-0.5 rounded-full font-bold border border-success/20">
                <ShieldCheck className="w-3 h-3" /> {trustScore}% Trust
              </span>
              {ride.vehicle_type && (
                <span className="flex items-center gap-1 text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-bold border border-accent/20">
                  <Bike className="w-3 h-3" /> {ride.vehicle_type}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-black text-accent flex items-center justify-end">
            <IndianRupee className="w-4 h-4" />
            <span>{ride.fare}</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-bold text-textSecondary">Total Fare</span>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-1 mt-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_8px_rgba(233,69,96,0.5)]" />
            <div className="w-0.5 h-10 bg-gradient-to-b from-accent/20 to-transparent" />
            <div className="w-2.5 h-2.5 rounded-full bg-surface-elevated" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-[10px] font-bold text-textSecondary uppercase leading-none mb-1">Pickup</p>
              <p className="font-bold text-textPrimary line-clamp-1">{ride.pickup_landmark?.name || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-textSecondary uppercase leading-none mb-1">Destination</p>
              <p className="font-bold text-textPrimary line-clamp-1">{ride.destination_landmark?.name || 'Unknown'}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-divider">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-textSecondary bg-surface px-3 py-2 rounded-xl border border-divider group-hover:border-accent/30 transition-colors">
              <Clock className="w-4 h-4 text-accent" />
              <div className="flex flex-col">
                <span className="text-xs font-black text-textPrimary leading-none tracking-tight flex items-center gap-1.5" suppressHydrationWarning>
                  {format(departureDate, 'h:mm a')} 
                  <span className="text-textSecondary/50 text-[10px] font-bold">→</span> 
                  <span className="text-accent">{format(arrivalDate, 'h:mm a')}</span>
                </span>
                <span className="text-[8px] font-black uppercase text-textSecondary tracking-[0.2em] mt-0.5 opacity-80">Est. Arrive Time</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-textSecondary bg-surface px-3 py-1.5 rounded-xl border border-divider">
              <Users className="w-4 h-4 text-accent" />
              <span className="text-xs font-bold">{ride.seat_available} left</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 text-success bg-success/10 px-3 py-1.5 rounded-xl border border-success/20">
            <Leaf className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Saves {co2Saved}kg CO2</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-center text-accent font-bold text-xs gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
        Book Now <ChevronRight className="w-4 h-4 animate-pulse" />
      </div>
    </div>
  );
}
