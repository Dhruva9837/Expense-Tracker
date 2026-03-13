import { supabase } from '@/lib/supabase';

export interface Message {
  id: string;
  ride_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender?: {
    name: string;
    avatar_url: string | null;
  };
}

export const chatService = {
  async getMessages(rideId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:profiles(name, avatar_url)')
      .eq('ride_id', rideId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data as Message[];
  },

  async sendMessage(rideId: string, message: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('messages')
      .insert([{ 
        ride_id: rideId, 
        sender_id: user.id, 
        message 
      }])
      .select()
      .single();

    if (error) throw error;
    return data as Message;
  },

  subscribeToMessages(rideId: string, onMessage: (message: Message) => void) {
    return supabase
      .channel(`ride_chat:${rideId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `ride_id=eq.${rideId}`
      }, async (payload) => {
        // Fetch sender info separately or use payload if sufficient
        const { data: messageWithSender, error } = await supabase
          .from('messages')
          .select('*, sender:profiles(name, avatar_url)')
          .eq('id', payload.new.id)
          .single();
        
        if (!error && messageWithSender) {
          onMessage(messageWithSender as Message);
        }
      })
      .subscribe();
  }
};
