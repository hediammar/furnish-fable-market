import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';
import { formatPrice } from '@/utils/currencyUtils';
import { mapDatabaseProductToAppProduct } from '@/services/productMappers';

// Define the filter options interface
export interface ProductFilterOptions {
  category?: string;
  search?: string;
  featured?: boolean;
  limit?: number;
  sortBy?: string;
  minPrice?: number;
  maxPrice?: number;
  materials?: string[]; // Added materials property
  colors?: string[];
}

export const fetchProducts = async (options: ProductFilterOptions = {}): Promise<Product[]> => {
  try {
    let query = supabase.from('products').select('*');
    
    // Apply filters
    if (options.category) {
      query = query.eq('category', options.category);
    }
    
    if (options.search) {
      query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%,category.ilike.%${options.search}%`);
    }
    
    if (options.featured !== undefined) {
      query = query.eq('is_featured', options.featured);
    }
    
    if (options.minPrice !== undefined) {
      query = query.gte('price', options.minPrice);
    }
    
    if (options.maxPrice !== undefined) {
      query = query.lte('price', options.maxPrice);
    }
    
    if (options.materials && options.materials.length > 0) {
      query = query.in('material', options.materials);
    }
    
    if (options.colors && options.colors.length > 0) {
      query = query.contains('colors', options.colors);
    }
    
    // Apply sorting
    if (options.sortBy) {
      switch (options.sortBy) {
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
    
    // Apply limit
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
    
    // Map database products to app products
    return (data || []).map(dbProduct => mapDatabaseProductToAppProduct(dbProduct));
  } catch (error) {
    console.error('Error in fetchProducts:', error);
    return [];
  }
};

export const fetchProductById = async (id: string): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching product by ID:', error);
      throw error;
    }
    
    if (!data) return null;
    
    return mapDatabaseProductToAppProduct(data);
  } catch (error) {
    console.error('Error in fetchProductById:', error);
    return null;
  }
};

export const fetchProductsByCategory = async (categoryId: string, sortBy = 'newest'): Promise<Product[]> => {
  try {
    const products = await fetchProducts({
      category: categoryId,
      sortBy
    });
    
    return products;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
};

export const fetchFeaturedProducts = async (): Promise<Product[]> => {
  try {
    const products = await fetchProducts({
      featured: true,
      limit: 6
    });
    
    return products;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
};

export const fetchRelatedProducts = async (productId: string, category: string): Promise<Product[]> => {
  try {
    // Fetch products in the same category, excluding the current product
    let query = supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .neq('id', productId)
      .limit(4);
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching related products:', error);
      throw error;
    }
    
    // Map database products to app products
    return (data || []).map(dbProduct => mapDatabaseProductToAppProduct(dbProduct));
  } catch (error) {
    console.error('Error in fetchRelatedProducts:', error);
    return [];
  }
};

// Add the deleteProduct function
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    throw error;
  }
};

// Add the createProduct function
export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([{
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        material: product.material,
        dimensions: product.dimensions,
        images: product.images,
        stock: product.stock || 0,
        is_featured: product.featured || false,
        is_new: product.new || false,
        discount: product.discount || 0
      }])
      .select();
    
    if (error) {
      console.error('Error creating product:', error);
      throw error;
    }
    
    return data && data.length > 0 ? mapDatabaseProductToAppProduct(data[0]) : null;
  } catch (error) {
    console.error('Error in createProduct:', error);
    throw error;
  }
};
