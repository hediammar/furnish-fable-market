
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
  try {
    // Check if the id is a UUID (to prevent the 'invalid input syntax for type uuid' error)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(id)) {
      // If not a UUID, try to find by slug or name (if your categories have such fields)
      // For now, just log the error and return null
      console.error('Invalid UUID format for category ID:', id);
      return null;
    }
    
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
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
};
