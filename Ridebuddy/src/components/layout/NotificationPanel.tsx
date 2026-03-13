'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Check, Clock, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'alert';
  created_at: string;
  read: boolean;
}

export default function NotificationPanel() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // In a real app, we'd have a 'notifications' table.
    // For the hackathon MVP, we'll derive some from ride_requests.
    const fetchNotifications = async () => {
      // Mock notifications for now to show the UI
      const mockNotifs: Notification[] = [
        { id: '1', message: 'Welcome to RideShare Campus! 🚲', type: 'info', created_at: new Date().toISOString(), read: false },
        { id: '2', message: 'Your ride to Main Gate was accepted! ✅', type: 'success', created_at: new Date().toISOString(), read: false },
        { id: '3', message: 'New request for your ride to Hostel A 👥', type: 'alert', created_at: new Date().toISOString(), read: true },
      ];
      setNotifications(mockNotifs);
      setUnreadCount(mockNotifs.filter(n => !n.read).length);
    };

    fetchNotifications();
  }, [user]);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-2xl glass-card hover:bg-white/10 transition-all active:scale-95 border-divider shadow-sm"
      >
        <Bell className="w-6 h-6 text-textSecondary" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-accent text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-primary">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-3 w-80 bg-surface rounded-3xl shadow-lg border border-divider overflow-hidden z-50 animate-in slide-in-from-top-5 duration-300">
            <div className="bg-accent-burst p-5 text-white flex items-center justify-between shadow-lg">
              <h3 className="font-black text-lg">Activity</h3>
              <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded-full uppercase tracking-wider">
                {unreadCount} New
              </span>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-10 text-center">
                  <Bell className="w-10 h-10 text-surface-elevated mx-auto mb-2" />
                  <p className="text-textSecondary text-sm font-bold">No new notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-divider/30">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-4 hover:bg-white/5 transition-colors flex gap-4 ${notif.read ? 'opacity-40' : ''}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-current shadow-sm ${
                        notif.type === 'success' ? 'bg-success/10 text-success' :
                        notif.type === 'alert' ? 'bg-error/10 text-error' : 'bg-info/10 text-info'
                      }`}>
                        {notif.type === 'success' ? <Check className="w-5 h-5" /> :
                         notif.type === 'alert' ? <Bell className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-textPrimary leading-snug">{notif.message}</p>
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-textSecondary font-bold uppercase tracking-wider">
                          <Clock className="w-3 h-3" />
                          Just now
                        </div>
                      </div>
                      {!notif.read && <div className="w-2 h-2 rounded-full bg-accent self-center shadow-[0_0_8px_rgba(233,69,96,0.6)]" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <button className="w-full text-center py-4 text-xs font-black text-accent border-t border-divider/30 hover:bg-white/5 transition-colors uppercase tracking-widest">
              Mark all as read
            </button>
          </div>
        </>
      )}
    </div>
  );
}
