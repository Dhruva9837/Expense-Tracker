'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  full_name: string;
  university_email: string;
  role: 'driver' | 'rider' | 'both';
  trust_score: number;
  rides_completed: number;
  avatar_url: string | null;
  created_at: string;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        setProfile(data as Profile);
      } else {
        // Only log if it's an actual error, not just 'No rows found' (e.g., during immediate signup before trigger finishes)
        if (error?.code !== 'PGRST116') {
           console.error('Error fetching profile:', error);
        }
      }
    } catch (e) {
      console.error('Exception fetching profile', e);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Expose an initial check function that doesn't rely just on the lazy state, useful for protected routes
  const requireAuth = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session;
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name }
      }
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  };

  const signInWithOtp = async (phone: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
    });
    return { data, error };
  };

  const verifyOTP = async (phone: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms'
    });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { 
    session, 
    user, 
    profile,
    loading, 
    signUp,
    signIn,
    signInWithOtp,
    verifyOTP,
    signOut 
  };
}
