'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { 
  MapPin, Navigation, Search, ArrowRight, ShieldCheck, 
  Clock, Zap, Users, Star, PlusCircle, AlertTriangle, UserCheck, Bike
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [hasVehicle, setHasVehicle] = useState<boolean | null>(null);

  useEffect(() => {
    if (user) {
      supabase
        .from('vehicles')
        .select('id')
        .eq('user_id', user.id)
        .then(({ data, error }) => {
          // If data is an array (from .select()), check its length
          // OR if using .single(), check if data exists
          setHasVehicle(!!data && (Array.isArray(data) ? data.length > 0 : !!data));
        });
    }
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/rides?pickup=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(destination)}`);
  };

  return (
    <div className="min-h-screen bg-primary text-textPrimary overflow-x-hidden font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        <div className="max-w-screen-xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Form & Copy */}
          <div className="space-y-10 animate-in slide-in-from-left duration-700">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[0.9] uppercase">
                Ride the <span className="text-accent">Campus Pulse</span>
              </h1>
              <p className="text-textSecondary text-lg font-medium max-w-lg leading-relaxed">
                The elite mobility network for students. Fast, secure, and hyper-local ride-sharing designed for modern campus life.
              </p>
            </div>

            {/* Uber-style Booking Form */}
            <div className="glass-card p-8 lg:p-10 shadow-2xl border-divider max-w-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-full pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-8">
                <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(233,69,96,0.6)]" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-textSecondary">Initiate Transport</h2>
              </div>

              <form onSubmit={handleSearch} className="space-y-6">
                <div className="space-y-4 relative">
                  {/* Pickup */}
                  <div className="relative">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                    <input 
                      type="text" 
                      placeholder="Enter pickup point"
                      className="w-full pl-14 pr-6 py-5 bg-surface-elevated rounded-2xl border border-divider focus:ring-2 focus:ring-accent/30 focus:border-accent/40 outline-none transition-all font-black text-textPrimary placeholder:text-textSecondary/30 text-sm"
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                    />
                  </div>

                  {/* Vertical Line Connector */}
                  <div className="absolute left-[1.85rem] top-12 bottom-12 w-[1px] bg-divider z-0" />

                  {/* Destination */}
                  <div className="relative">
                    <Navigation className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                    <input 
                      type="text" 
                      placeholder="Where to next?"
                      className="w-full pl-14 pr-6 py-5 bg-surface-elevated rounded-2xl border border-divider focus:ring-2 focus:ring-accent/30 focus:border-accent/40 outline-none transition-all font-black text-textPrimary placeholder:text-textSecondary/30 text-sm"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <Link 
                    href="/request-ride"
                    className="flex-1 px-6 py-4 bg-surface rounded-xl border border-divider text-[10px] font-black uppercase tracking-widest text-textSecondary hover:text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <Clock className="w-4 h-4" /> Schedule
                  </Link>
                  <button 
                    type="submit"
                    className="flex-[1.5] btn-primary py-5 shadow-xl shadow-accent/20 flex items-center justify-center gap-3 group active:scale-95 transition-all"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Find Ride</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-10 pt-4">
              <div>
                <p className="text-3xl font-black text-white leading-none">5k+</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-textSecondary mt-2">Active Rides</p>
              </div>
              <div className="w-[1px] h-10 bg-divider" />
              <div>
                <p className="text-3xl font-black text-white leading-none">98%</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-textSecondary mt-2">Safety Score</p>
              </div>
            </div>
          </div>

          {/* Right Column: Visual */}
          <div className="relative lg:flex flex-col items-center hidden animate-in zoom-in duration-1000 delay-200 w-full">
            
            {/* Feature Action Buttons (Above Image) */}
            <div className="flex gap-4 mb-10 w-full justify-center relative z-20">
               <button className="glass-card bg-surface px-4 py-4 border border-divider flex flex-col items-center justify-center gap-3 rounded-2xl shadow-md hover:-translate-y-1 hover:border-info/40 hover:shadow-info/20 hover:bg-info/5 transition-all w-32 group">
                 <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center">
                   <MapPin className="w-5 h-5 text-info group-hover:scale-110 transition-transform" />
                 </div>
                 <span className="text-textPrimary font-black text-[10px] uppercase tracking-widest text-center leading-tight">Live<br/>Sharing</span>
               </button>
                              <Link href="/driver" className="glass-card bg-surface px-4 py-4 border border-divider flex flex-col items-center justify-center gap-3 rounded-2xl shadow-md hover:-translate-y-1 hover:border-success/40 hover:shadow-success/20 hover:bg-success/5 transition-all w-32 group relative">
                  {(user && hasVehicle === false) && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-warning rounded-full flex items-center justify-center animate-bounce shadow-lg z-30">
                      <AlertTriangle className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                    <PlusCircle className="w-5 h-5 text-success group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-textPrimary font-black text-[10px] uppercase tracking-widest text-center leading-tight">
                    {hasVehicle === false ? 'Register\nVehicle' : 'Ride\nCreation'}
                  </span>
                </Link>
               
               <button className="glass-card bg-surface px-4 py-4 border border-divider flex flex-col items-center justify-center gap-3 rounded-2xl shadow-md hover:-translate-y-1 hover:border-error/40 hover:shadow-error/20 hover:bg-error/5 transition-all w-32 group">
                 <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
                   <AlertTriangle className="w-5 h-5 text-error group-hover:animate-pulse" />
                 </div>
                 <span className="text-textPrimary font-black text-[10px] uppercase tracking-widest text-center leading-tight">Emergency<br/>SOS</span>
               </button>
            </div>

            <div className="relative w-full max-w-sm">
              <div className="absolute -inset-10 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
              <div className="relative z-10 glass-card p-4 rounded-[3rem] border-divider shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700 overflow-hidden group">
                 {/* Embed the generated image absolute path here */}
                 <img 
                  src="/hero.png" 
                  alt="Campus Mobility" 
                  className="w-full h-auto rounded-[2.5rem] grayscale-[20%] sepia-[10%] group-hover:grayscale-0 transition-all duration-700"
                 />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="pb-24 px-6 relative z-30 flex justify-center w-full min-w-full animate-in slide-in-from-bottom-10 duration-1000 delay-300">
        <div className="w-full max-w-4xl glass-card border border-divider/50 rounded-[2.5rem] p-6 lg:p-10 shadow-2xl shadow-accent/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-info/5 rounded-full blur-[80px] pointer-events-none" />
          
          {/* Mockup Top Bar */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-divider/50 relative z-10">
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-textPrimary tracking-tight">Hi, Student! 👋</h3>
              <p className="text-textSecondary text-xs font-bold uppercase tracking-widest">Dashboard Preview</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-surface-elevated border border-divider flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-accent" />
            </div>
          </div>

          {/* Role Cards */}
          <div className="grid grid-cols-2 gap-5 mb-10 relative z-10">
            <Link href="/create-ride" className="bg-surface-elevated p-6 rounded-3xl flex flex-col gap-4 border border-accent/20 hover:-translate-y-1 transition-transform group cursor-pointer">
              <div className="p-4 bg-accent/10 rounded-2xl w-fit"><Bike className="w-6 h-6 text-accent"/></div>
              <div>
                <p className="text-sm font-black uppercase text-textPrimary tracking-tight">Driver</p>
                <p className="text-[10px] text-textSecondary font-bold mt-1 leading-relaxed">Post your 2-wheeler route & fare</p>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-accent bg-accent/10 px-3 py-1.5 rounded-xl w-fit">Post Route →</span>
            </Link>
            <Link href="/rides" className="bg-surface-elevated p-6 rounded-3xl flex flex-col gap-4 border border-info/20 hover:-translate-y-1 transition-transform group cursor-pointer">
              <div className="p-4 bg-info/10 rounded-2xl w-fit"><Users className="w-6 h-6 text-info"/></div>
              <div>
                <p className="text-sm font-black uppercase text-textPrimary tracking-tight">Rider</p>
                <p className="text-[10px] text-textSecondary font-bold mt-1 leading-relaxed">Browse rides or post a request</p>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-info bg-info/10 px-3 py-1.5 rounded-xl w-fit">Find Ride →</span>
            </Link>
          </div>

          {/* Mockup Feed */}
          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-5 py-2.5 bg-surface-elevated text-textPrimary rounded-full text-[10px] font-black uppercase tracking-widest border border-divider">Live 2-Wheeler Rides</span>
              <span className="flex items-center gap-1.5 px-3 py-2 bg-accent/10 text-accent rounded-full text-[9px] font-black uppercase tracking-widest border border-accent/20"><Bike className="w-3 h-3"/>Only</span>
            </div>

            <div className="bg-surface-elevated p-6 rounded-[2rem] border border-divider flex items-center justify-between hover:border-accent/30 transition-colors">
              <div className="flex items-center gap-5">
                 <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center pointer-events-none">
                   <MapPin className="w-5 h-5 text-accent" />
                 </div>
                 <div>
                   <p className="text-sm font-black text-textPrimary tracking-tight">Saharanpur → Gangoh</p>
                   <p className="text-[10px] text-textSecondary uppercase tracking-widest font-bold mt-1.5 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Today, 2:30 PM • 1 Seat
                    </p>
                    <p className="text-[9px] text-accent font-black uppercase tracking-widest mt-1 flex items-center gap-1"><Bike className="w-3 h-3"/>Scooter</p>
                  </div>
               </div>
               <div className="text-right">
                 <p className="text-lg font-black text-accent">₹30</p>
                 <div className="text-[10px] font-black uppercase bg-accent/10 text-accent px-4 py-2 rounded-xl mt-2 tracking-widest cursor-default">Join</div>
               </div>
            </div>

            <div className="bg-surface-elevated/50 p-6 rounded-[2rem] border border-divider flex items-center justify-between opacity-70 hover:opacity-100 hover:border-accent/30 transition-all">
              <div className="flex items-center gap-5">
                 <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center pointer-events-none">
                   <MapPin className="w-5 h-5 text-accent" />
                 </div>
                 <div>
                   <p className="text-sm font-black text-textPrimary tracking-tight">Gangoh → Saharanpur</p>
                   <p className="text-[10px] text-textSecondary uppercase tracking-widest font-bold mt-1.5 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Today, 4:00 PM • 1 Seat
                    </p>
                    <p className="text-[9px] text-accent font-black uppercase tracking-widest mt-1 flex items-center gap-1"><Bike className="w-3 h-3"/>Bike</p>
                  </div>
               </div>
               <div className="text-right">
                 <p className="text-lg font-black text-accent">₹15</p>
                 <div className="text-[10px] font-black uppercase bg-accent/10 text-accent px-4 py-2 rounded-xl mt-2 tracking-widest cursor-default">Join</div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features & Trust Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-screen-xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-[10px] font-black text-accent uppercase tracking-[0.5em]">The Ecosystem</h2>
            <p className="text-4xl lg:text-5xl font-black tracking-tighter uppercase max-w-2xl mx-auto leading-none">
              Engineered for the <span className="text-textSecondary">Student Collective</span>
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: <ShieldCheck className="w-8 h-8" />, 
                title: "University Verified", 
                desc: "Every passenger and driver is identity-verified via campus credentials.",
                color: "text-accent"
              },
              { 
                icon: <Users className="w-8 h-8" />, 
                title: "Peer Powered", 
                desc: "Join a trusted community of students heading your way, every single day.",
                color: "text-info"
              },
              { 
                icon: <Zap className="w-8 h-8" />, 
                title: "Instant Match", 
                desc: "Our real-time engine syncs you with available slots in milliseconds.",
                color: "text-success"
              }
            ].map((feat, i) => (
              <div key={i} className="glass-card p-10 space-y-6 hover:border-accent/40 transition-all group">
                <div className={`${feat.color} p-4 bg-surface rounded-2xl w-min border border-divider group-hover:scale-110 transition-transform`}>
                  {feat.icon}
                </div>
                <h3 className="text-xl font-black tracking-tight">{feat.title}</h3>
                <p className="text-textSecondary text-sm leading-relaxed font-medium">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer / CTA */}
      <footer className="py-20 px-6 border-t border-divider">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-3 text-2xl font-black tracking-tight uppercase">
            <div className="w-10 h-10 bg-accent-burst rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            RideBuddy
          </div>
          <p className="text-textSecondary text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
            © 2026 Mobility Protocol • All Rights Reserved
          </p>
          <div className="flex gap-8">
            <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-textSecondary hover:text-accent transition-colors">Access</Link>
            <Link href="/signup" className="text-[10px] font-black uppercase tracking-widest text-textSecondary hover:text-accent transition-colors">Register</Link>
            <Link href="/support" className="text-[10px] font-black uppercase tracking-widest text-textSecondary hover:text-accent transition-colors">Help</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
