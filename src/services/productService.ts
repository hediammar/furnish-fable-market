
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';
import { formatPrice } from '@/utils/currencyUtils';

// Define the filter options locally to avoid circular imports
interface ProductFilterOptions {
  category?: string;
  search?: string;
  featured?: boolean;
  limit?: number;
  sortBy?: string;
  minPrice?: number;
  maxPrice?: number;
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
      query = query.eq('featured', options.featured);
    }
    
    if (options.minPrice !== undefined) {
      query = query.gte('price', options.minPrice);
    }
    
    if (options.maxPrice !== undefined) {
      query = query.lte('price', options.maxPrice);
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
    
    // Format the prices to include the currency symbol
    return (data || []).map(product => ({
      ...product,
      formattedPrice: formatPrice(product.price)
    })) as Product[];
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
    
    return {
      ...data,
      formattedPrice: formatPrice(data.price)
    } as Product;
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
    
    // Format the prices to include the currency symbol
    return (data || []).map(product => ({
      ...product,
      formattedPrice: formatPrice(product.price)
    })) as Product[];
  } catch (error) {
    console.error('Error in fetchRelatedProducts:', error);
    return [];
  }
};
