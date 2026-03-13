import { supabase } from '@/lib/supabase';

export interface SOSAlert {
  id: string;
  user_id: string;
  ride_id: string | null;
  location: string;
  created_at: string;
}

export const sosService = {
  async triggerSOS(location: string, rideId: string | null = null) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('sos_alerts')
      .insert([{ 
        user_id: user.id, 
        ride_id: rideId, 
        location 
      }])
      .select()
      .single();

    if (error) throw error;
    
    // In a real app, this might trigger a push notification or SMS via edge function
    console.log('SOS triggered:', data);
    return data as SOSAlert;
  },

  async getMySOSAlerts() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('sos_alerts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as SOSAlert[];
  }
};
