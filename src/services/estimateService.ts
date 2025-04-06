
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface Estimate {
  id: string;
  user_id: string | null;
  total_amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  contact_email: string;
  contact_phone: string;
  shipping_address: string;
  items: {
    product_id: string;
    quantity: number;
    name: string;
  }[];
  created_at: string;
  updated_at?: string;
}

export const fetchEstimates = async (): Promise<Estimate[]> => {
  try {
    console.log('Fetching estimates...');
    const { data, error } = await supabase
      .from('estimates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching estimates:', error);
      throw error;
    }

    console.log('Fetched estimates data:', data);

    // Properly parse and transform the data
    return (data || []).map((estimate: any) => ({
      ...estimate,
      status: estimate.status as 'pending' | 'approved' | 'rejected' | 'completed',
      // Parse JSON data if stored as strings
      items: typeof estimate.items === 'string' 
        ? JSON.parse(estimate.items) 
        : Array.isArray(estimate.items) 
          ? estimate.items 
          : [],
      shipping_address: typeof estimate.shipping_address === 'string' 
        ? JSON.parse(estimate.shipping_address) 
        : estimate.shipping_address
    })) as Estimate[];
  } catch (error) {
    console.error('Error in fetchEstimates:', error);
    return [];
  }
};

export const fetchEstimateById = async (id: string): Promise<Estimate> => {
  const { data, error } = await supabase
    .from('estimates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching estimate:', error);
    throw error;
  }

  // Properly cast and parse JSON data
  return {
    ...data,
    status: data.status as 'pending' | 'approved' | 'rejected' | 'completed',
    items: typeof data.items === 'string' ? JSON.parse(data.items) : data.items,
    shipping_address: typeof data.shipping_address === 'string' 
      ? JSON.parse(data.shipping_address) 
      : data.shipping_address
  } as Estimate;
};

export const updateEstimateStatus = async (id: string, status: Estimate['status']): Promise<void> => {
  const { error } = await supabase
    .from('estimates')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error updating estimate status:', error);
    throw error;
  }
};

export const deleteEstimate = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('estimates')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting estimate:', error);
    throw error;
  }
};

// Function to fetch estimates for a specific user
export const fetchUserEstimates = async (userId: string): Promise<Estimate[]> => {
  try {
    const { data, error } = await supabase
      .from('estimates')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user estimates:', error);
      throw error;
    }

    // Properly parse and transform the data
    return (data || []).map((estimate: any) => ({
      ...estimate,
      status: estimate.status as 'pending' | 'approved' | 'rejected' | 'completed',
      // Parse JSON data if stored as strings
      items: typeof estimate.items === 'string' 
        ? JSON.parse(estimate.items) 
        : Array.isArray(estimate.items) 
          ? estimate.items 
          : [],
      shipping_address: typeof estimate.shipping_address === 'string' 
        ? JSON.parse(estimate.shipping_address) 
        : estimate.shipping_address
    })) as Estimate[];
  } catch (error) {
    console.error('Error in fetchUserEstimates:', error);
    return [];
  }
};
