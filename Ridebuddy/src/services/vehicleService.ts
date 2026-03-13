import { supabase } from '@/lib/supabase';

export interface Vehicle {
  id: string;
  user_id: string;
  vehicle_model: string;
  vehicle_number: string;
  seat_capacity: number;
  created_at?: string;
}

export const vehicleService = {
  async getMyVehicles() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('user_id', user.id);
    
    if (error) throw error;
    return data as Vehicle[];
  },

  async registerVehicle(vehicle: Omit<Vehicle, 'id' | 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('vehicles')
      .insert([{ ...vehicle, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data as Vehicle;
  },

  async deleteVehicle(vehicleId: string) {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', vehicleId);
    
    if (error) throw error;
  }
};
