
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
    return (data || []).map((estimate: any) => {
      // Parse JSON fields if needed
      let parsedItems = estimate.items;
      let parsedAddress = estimate.shipping_address;
      
      try {
        // If items is a string, try to parse it
        if (typeof parsedItems === 'string') {
          parsedItems = JSON.parse(parsedItems);
        }
        
        // If the parsed result is not an array, ensure it is
        if (!Array.isArray(parsedItems)) {
          console.warn('Items is not an array:', parsedItems);
          parsedItems = [];
        }
        
        // Handle shipping_address parsing
        if (typeof parsedAddress === 'string') {
          try {
            parsedAddress = JSON.parse(parsedAddress);
          } catch (e) {
            // If it can't be parsed as JSON, use it as is (string address)
            console.log('Using shipping_address as string');
          }
        }
      } catch (error) {
        console.error('Error parsing JSON data:', error);
        parsedItems = Array.isArray(estimate.items) ? estimate.items : [];
        parsedAddress = estimate.shipping_address;
      }
      
      return {
        ...estimate,
        status: estimate.status as 'pending' | 'approved' | 'rejected' | 'completed',
        items: parsedItems,
        shipping_address: parsedAddress
      };
    }) as Estimate[];
  } catch (error) {
    console.error('Error in fetchEstimates:', error);
    return [];
  }
};

export const fetchEstimateById = async (id: string): Promise<Estimate> => {
  try {
    const { data, error } = await supabase
      .from('estimates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching estimate:', error);
      throw error;
    }

    // Parse JSON fields if needed
    let parsedItems = data.items;
    let parsedAddress = data.shipping_address;
    
    try {
      // If items is a string, try to parse it
      if (typeof parsedItems === 'string') {
        parsedItems = JSON.parse(parsedItems);
      }
      
      // If the parsed result is not an array, ensure it is
      if (!Array.isArray(parsedItems)) {
        console.warn('Items is not an array:', parsedItems);
        parsedItems = [];
      }
      
      // Handle shipping_address parsing
      if (typeof parsedAddress === 'string') {
        try {
          parsedAddress = JSON.parse(parsedAddress);
        } catch (e) {
          // If it can't be parsed as JSON, use it as is (string address)
          console.log('Using shipping_address as string');
        }
      }
    } catch (error) {
      console.error('Error parsing JSON data:', error);
      parsedItems = Array.isArray(data.items) ? data.items : [];
      parsedAddress = data.shipping_address;
    }
    
    return {
      ...data,
      status: data.status as 'pending' | 'approved' | 'rejected' | 'completed',
      items: parsedItems,
      shipping_address: parsedAddress
    } as Estimate;
  } catch (error) {
    console.error('Error in fetchEstimateById:', error);
    throw error;
  }
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
    return (data || []).map((estimate: any) => {
      // Parse JSON fields if needed
      let parsedItems = estimate.items;
      let parsedAddress = estimate.shipping_address;
      
      try {
        // If items is a string, try to parse it
        if (typeof parsedItems === 'string') {
          parsedItems = JSON.parse(parsedItems);
        }
        
        // If the parsed result is not an array, ensure it is
        if (!Array.isArray(parsedItems)) {
          console.warn('Items is not an array:', parsedItems);
          parsedItems = [];
        }
        
        // Handle shipping_address parsing
        if (typeof parsedAddress === 'string') {
          try {
            parsedAddress = JSON.parse(parsedAddress);
          } catch (e) {
            // If it can't be parsed as JSON, use it as is (string address)
            console.log('Using shipping_address as string');
          }
        }
      } catch (error) {
        console.error('Error parsing JSON data:', error);
        parsedItems = Array.isArray(estimate.items) ? estimate.items : [];
        parsedAddress = estimate.shipping_address;
      }
      
      return {
        ...estimate,
        status: estimate.status as 'pending' | 'approved' | 'rejected' | 'completed',
        items: parsedItems,
        shipping_address: parsedAddress
      };
    }) as Estimate[];
  } catch (error) {
    console.error('Error in fetchUserEstimates:', error);
    return [];
  }
};
