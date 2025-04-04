
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';

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

  let query = supabase.from('products').select('*');
  
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
    query = query.in('material', materials as unknown as string[]);
  }
  
  if (colors && colors.length > 0) {
    query = query.in('color', colors as unknown as string[]);
  }
  
  if (search) {
    query = query.ilike('name', `%${search}%`);
  }
  
  if (featured !== undefined) {
    query = query.eq('is_featured', featured);
  }

  if (sort === 'price-asc') {
    query = query.order('price', { ascending: true });
  } else if (sort === 'price-desc') {
    query = query.order('price', { ascending: false });
  } else if (sort === 'rating') {
    query = query.order('rating', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
  
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

export const fetchProductsByCategory = async (
  categoryId: string,
  sort: string = 'newest'
): Promise<Product[]> => {
  let query = supabase
    .from('products')
    .select('*')
    .eq('category', categoryId) as any;
  
  if (sort === 'price-asc') {
    query = query.order('price', { ascending: true });
  } else if (sort === 'price-desc') {
    query = query.order('price', { ascending: false });
  } else if (sort === 'rating') {
    query = query.order('rating', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
  
  return (data || []).map(mapDatabaseProductToAppProduct);
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

// Map database product to our app's Product type
export const mapDatabaseProductToAppProduct = (dbProduct: any): Product => {
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
