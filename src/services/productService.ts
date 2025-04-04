
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';
import { mapDatabaseProductToAppProduct } from './productMappers';

// Define filter parameters type to avoid excessive type inference
export interface ProductFilterParams {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  materials?: string[];
  colors?: string[];
  sort?: string;
  search?: string;
  featured?: boolean;
}

export const fetchProducts = async (params: ProductFilterParams = {}): Promise<Product[]> => {
  const { 
    category, 
    minPrice, 
    maxPrice, 
    materials, 
    colors, 
    sort,
    search,
    featured
  } = params;

  // Start with a basic query
  let query = supabase.from('products').select('*');
  
  // Apply filters one by one
  if (category) {
    query = query.eq('category', category);
  }
  
  if (minPrice !== undefined) {
    query = query.gte('price', minPrice);
  }
  
  if (maxPrice !== undefined) {
    query = query.lte('price', maxPrice);
  }
  
  if (materials && materials.length > 0) {
    // Use specific type assertion to avoid infinite recursion
    query = query.in('material', materials as unknown as string[]);
  }
  
  if (colors && colors.length > 0) {
    // Use specific type assertion to avoid infinite recursion
    query = query.in('color', colors as unknown as string[]);
  }
  
  if (search) {
    query = query.ilike('name', `%${search}%`);
  }
  
  if (featured !== undefined) {
    query = query.eq('is_featured', featured);
  }

  // Apply sorting based on sort parameter
  let finalQuery = query;
  
  if (sort === 'price-asc') {
    finalQuery = finalQuery.order('price', { ascending: true });
  } else if (sort === 'price-desc') {
    finalQuery = finalQuery.order('price', { ascending: false });
  } else if (sort === 'rating') {
    finalQuery = finalQuery.order('rating', { ascending: false });
  } else {
    finalQuery = finalQuery.order('created_at', { ascending: false });
  }
  
  // Execute query
  const { data, error } = await finalQuery;
  
  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
  
  // Map database products to our app's Product type
  return (data || []).map(mapDatabaseProductToAppProduct);
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
  
  return data ? mapDatabaseProductToAppProduct(data) : null;
};

export const fetchProductsByCategory = async (categoryId: string, sort = 'newest'): Promise<Product[]> => {
  return fetchProducts({ category: categoryId, sort });
};

export const fetchRelatedProducts = async (productId: string, category: string): Promise<Product[]> => {
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
  
  return (data || []).map(mapDatabaseProductToAppProduct);
};

export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product | null> => {
  // Convert from our app's Product type to database format
  const dbProduct = {
    name: product.name,
    description: product.description,
    price: product.price,
    images: product.images,
    category: product.category,
    material: product.material,
    dimensions: product.dimensions,
    stock: product.stock || 0,
    is_featured: product.featured || false,
    is_new: product.new || false,
    discount: product.discount || null
  };

  const { data, error } = await supabase
    .from('products')
    .insert(dbProduct)
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw error;
  }

  return data ? mapDatabaseProductToAppProduct(data) : null;
};

export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};
