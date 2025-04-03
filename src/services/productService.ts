
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';

export interface Category {
  id: string;
  created_at: string | null;
  name: string;
  description?: string;
  image?: string;
}

// Map database product to our app's Product type
const mapDatabaseProductToAppProduct = (dbProduct: any): Product => {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description || '',
    price: dbProduct.price,
    images: dbProduct.images || [dbProduct.image].filter(Boolean),
    category: dbProduct.category || '',
    material: dbProduct.material,
    dimensions: dbProduct.dimensions,
    inStock: dbProduct.stock > 0,
    stock: dbProduct.stock,
    featured: dbProduct.is_featured,
    new: dbProduct.is_new,
    discount: dbProduct.discount
  };
};

export const fetchProducts = async ({ 
  category, 
  minPrice, 
  maxPrice, 
  materials, 
  colors, 
  sort,
  search,
  featured
}: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  materials?: string[];
  colors?: string[];
  sort?: string;
  search?: string;
  featured?: boolean;
} = {}) => {
  let query = supabase
    .from('products')
    .select('*');
  
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
    query = query.in('material', materials);
  }
  
  if (colors && colors.length > 0) {
    // Assuming you have a 'colors' column in your database
    query = query.in('color', colors);
  }
  
  if (search) {
    query = query.ilike('name', `%${search}%`);
  }
  
  if (featured !== undefined) {
    query = query.eq('is_featured', featured);
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
  
  return data.map(mapDatabaseProductToAppProduct) as Product[];
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
  
  return mapDatabaseProductToAppProduct(data);
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
  
  return data.map(mapDatabaseProductToAppProduct) as Product[];
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
  
  return data.map(mapDatabaseProductToAppProduct) as Product[];
};

// Add the missing createProduct function
export const createProduct = async (product: Omit<Product, 'id'>) => {
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

  return mapDatabaseProductToAppProduct(data);
};

// Add the missing deleteProduct function
export const deleteProduct = async (id: string) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};
