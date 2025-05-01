import { supabase } from '@/integrations/supabase/client';

export interface AppointmentSlot {
  date: string;
  time: string;
  isAvailable: boolean;
}

export interface Appointment {
  id: number;
  user_id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export const appointmentService = {
  async getAvailableSlots(date: string): Promise<AppointmentSlot[]> {
    // Get all appointments for the given date
    const { data: existingAppointments, error } = await supabase
      .from('rendezvous')
      .select('appointment_time')
      .eq('appointment_date', date)
      .eq('status', 'confirmed');

    if (error) throw error;

    // Generate all possible slots for the day (9:00 to 18:00, every 30 minutes)
    const slots: AppointmentSlot[] = [];
    const startHour = 9;
    const endHour = 18;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute of [0, 30]) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const isAvailable = !existingAppointments?.some(
          (appt) => appt.appointment_time === time
        );
        
        slots.push({
          date,
          time,
          isAvailable
        });
      }
    }

    return slots;
  },

  async createAppointment(date: string, time: string): Promise<Appointment> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('rendezvous')
      .insert([
        {
          user_id: user.id,
          appointment_date: date,
          appointment_time: time,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserAppointments(): Promise<Appointment[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('rendezvous')
      .select('*')
      .eq('user_id', user.id)
      .order('appointment_date', { ascending: true });

    if (error) throw error;
    return data;
  }
}; 