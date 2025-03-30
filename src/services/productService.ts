
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';

export const fetchProducts = async (filters?: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  materials?: string[];
  colors?: string[];
  featured?: boolean;
  isNew?: boolean;
  search?: string;
  sort?: string;
}) => {
  let query = supabase.from('products').select('*');

  // Apply filters
  if (filters) {
    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }
    
    if (filters.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }
    
    if (filters.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }
    
    if (filters.materials && filters.materials.length > 0) {
      // Using containedBy for array comparison
      const materialConditions = filters.materials.map(material => {
        return `material.ilike.%${material}%`;
      });
      query = query.or(materialConditions.join(','));
    }
    
    if (filters.colors && filters.colors.length > 0) {
      // Check if product's colors array contains any of the selected colors
      const colorConditions = filters.colors.map(color => {
        return `colors.cs.{${color}}`;
      });
      query = query.or(colorConditions.join(','));
    }
    
    if (filters.featured !== undefined) {
      query = query.eq('is_featured', filters.featured);
    }
    
    if (filters.isNew !== undefined) {
      query = query.eq('is_new', filters.isNew);
    }
    
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    
    // Apply sorting
    if (filters.sort) {
      switch (filters.sort) {
        case 'price-asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price-desc':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }
    } else {
      // Default sorting
      query = query.order('created_at', { ascending: false });
    }
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
  
  return data as unknown as Product[];
};

export const fetchProductById = async (id: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
  
  return data as unknown as Product;
};

export const fetchCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
  
  return data;
};

export const createProduct = async (product: Omit<Product, 'id'>) => {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating product:', error);
    throw error;
  }
  
  return data as unknown as Product;
};

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }
  
  return data as unknown as Product;
};

export const deleteProduct = async (id: string) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
  
  return true;
};
