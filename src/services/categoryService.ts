
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types/category';

export const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
  
  return data as Category[];
};

export const fetchCategoryById = async (id: string): Promise<Category | null> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
  
  return data as Category;
};
