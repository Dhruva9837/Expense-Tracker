'use client';

import { MapPin, Navigation, Car } from 'lucide-react';

interface MapViewProps {
  startLocation: string;
  destination: string;
  className?: string;
  isActive?: boolean;
}

export default function MapView({ startLocation, destination, className = "", isActive = false }: MapViewProps) {
  // In a real app, we would use Google Maps API here.
  // For the MVP/Hackathon, we'll show a beautiful mock visualization of the route.
  
  return (
    <div className={`relative w-full h-64 bg-slate-200 rounded-2xl overflow-hidden border border-slate-300 shadow-inner ${className}`}>
      {/* Mock Map Background - Using a subtle grid pattern */}
      <div className="absolute inset-0 opacity-20" 
           style={{ backgroundImage: 'radial-gradient(#1e40af 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      
      {/* Route Line */}
      <div className="absolute top-1/2 left-1/4 right-1/4 h-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] z-10">
        {/* Animated flow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent w-full animate-progress-flow" />
        
        {/* Live Tracking Marker */}
        {isActive && (
          <div className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(59,130,246,0.8)] border-2 border-white z-30 pointer-events-none animate-live-track transition-all">
            <Car className="w-4 h-4 animate-pulse" />
          </div>
        )}
      </div>
      
      {/* Start Marker */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-full z-20 flex flex-col items-center">
        <div className="bg-white p-2 rounded-xl shadow-lg border border-blue-100 flex items-center gap-2 mb-1 animate-bounce">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="text-[10px] font-bold text-slate-700 whitespace-nowrap">{startLocation}</span>
        </div>
        <div className="w-3 h-3 bg-blue-600 rounded-full border-2 border-white" />
      </div>
      
      {/* Destination Marker */}
      <div className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-full z-20 flex flex-col items-center">
        <div className="bg-white p-2 rounded-xl shadow-lg border border-red-100 flex items-center gap-2 mb-1">
          <Navigation className="w-4 h-4 text-red-600" />
          <span className="text-[10px] font-bold text-slate-700 whitespace-nowrap">{destination}</span>
        </div>
        <div className="w-3 h-3 bg-red-600 rounded-full border-2 border-white" />
      </div>
      
      {/* Map Controls Mock */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center text-slate-600 font-bold">+</button>
        <button className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center text-slate-600 font-bold">-</button>
      </div>

      <div className="absolute bottom-2 left-2 px-2 py-1 bg-white/80 backdrop-blur-sm rounded-md text-[8px] text-slate-400 font-medium">
        Google Maps API Mock
      </div>
    </div>
  );
}
