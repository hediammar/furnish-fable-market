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
  
  console.log('Fetched categories:', data);
  return data as Category[];
};

export const fetchCategoryById = async (id: string): Promise<Category | null> => {
  try {
    // Check if the id is a UUID (to prevent the 'invalid input syntax for type uuid' error)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (uuidRegex.test(id)) {
      // If it's a UUID, query by ID
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching category by ID:', error);
        return null;
      }
      
      console.log('Fetched category by ID:', data);
      return data as Category;
    } else {
      // If not a UUID, try to find by name
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .ilike('name', id)
        .single();
      
      if (error) {
        console.error('Error fetching category by name:', error);
        
        // Try as a more general search
        const { data: fuzzyData, error: fuzzyError } = await supabase
          .from('categories')
          .select('*')
          .ilike('name', `%${id}%`)
          .single();
          
        if (fuzzyError) {
          console.error('Error in fuzzy category search:', fuzzyError);
          return null;
        }
        
        console.log('Fetched category by fuzzy search:', fuzzyData);
        return fuzzyData as Category;
      }
      
      console.log('Fetched category by name:', data);
      return data as Category;
    }
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
};
