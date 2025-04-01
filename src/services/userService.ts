
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/supabase';

export const fetchUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
  
  return data as Profile[];
};

export const fetchUserById = async (id: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
  
  return data as Profile;
};

export const updateUserRole = async (id: string, isAdmin: boolean) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ 
      is_admin: isAdmin,
      role: isAdmin ? 'admin' : 'user',
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
  
  return data as Profile;
};

export const updateUserProfile = async (id: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
  
  return data as Profile;
};
