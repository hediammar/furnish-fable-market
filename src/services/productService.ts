import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  created_at: string | null;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  material?: string;
  dimensions?: string;
  inStock: boolean;
  discount?: number;
  rating?: number;
}

export interface Category {
  id: string;
  created_at: string | null;
  name: string;
  description?: string;
  image?: string;
}

export const fetchProducts = async ({ category, minPrice, maxPrice, materials, colors, sort, search }: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  materials?: string[];
  colors?: string[];
  sort?: string;
  search?: string;
} = {}) => {
  let query = supabase
    .from('products')
    .select('*');
  
  if (category) {
    query = query.eq('category', category);
  }
  
  if (minPrice) {
    query = query.gte('price', minPrice);
  }
  
  if (maxPrice) {
    query = query.lte('price', maxPrice);
  }
  
  if (materials) {
    query = query.in('material', materials);
  }
  
  if (colors) {
    // Assuming you have a 'colors' column in your database
    query = query.in('color', colors);
  }
  
  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  // Apply sorting
  switch (sort) {
    case 'price-asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price-desc':
      query = query.order('price', { ascending: false });
      break;
    case 'rating':
      query = query.order('rating', { ascending: false });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
  
  return data as Product[];
};

export const fetchProductById = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching product by ID:', error);
    throw error;
  }
  
  return data as Product;
};

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

export const fetchCategoryById = async (id: string) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
  
  return data;
};

export const fetchProductsByCategory = async (categoryId: string, sort = 'newest') => {
  let query = supabase
    .from('products')
    .select('*')
    .eq('category', categoryId);
  
  // Apply sorting
  switch (sort) {
    case 'price-asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price-desc':
      query = query.order('price', { ascending: false });
      break;
    case 'rating':
      query = query.order('rating', { ascending: false });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
  
  return data;
};

export const fetchRelatedProducts = async (productId: string, category: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .neq('id', productId)
    .limit(4);
  
  if (error) {
    console.error('Error fetching related products:', error);
    throw error;
  }
  
  return data;
};
