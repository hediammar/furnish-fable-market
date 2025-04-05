
import { supabase } from '@/integrations/supabase/client';
import { Partner, PartnerDB } from '@/types/partner';

export const fetchPartners = async (): Promise<Partner[]> => {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching partners:', error);
    throw error;
  }

  return (data || []) as Partner[];
};

export const createPartner = async (partner: Omit<Partner, 'id' | 'created_at' | 'updated_at'>): Promise<Partner> => {
  const { data, error } = await supabase
    .from('partners')
    .insert(partner)
    .select()
    .single();

  if (error) {
    console.error('Error creating partner:', error);
    throw error;
  }

  return data as Partner;
};

export const updatePartner = async (id: string, partner: Partial<Partner>): Promise<Partner> => {
  const { data, error } = await supabase
    .from('partners')
    .update(partner)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating partner:', error);
    throw error;
  }

  return data as Partner;
};

export const deletePartner = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('partners')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting partner:', error);
    throw error;
  }
};
