import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';
import { formatPrice } from '@/utils/currencyUtils';
import { mapDatabaseProductToAppProduct } from '@/services/productMappers';

// Define the filter options interface
export interface ProductFilterOptions {
  category?: string;
  categories?: string[];
  subcategory?: string;
  search?: string;
  featured?: boolean;
  limit?: number;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  materials?: string[];
  colors?: string[];
  stock?: boolean;
  new?: boolean;
}

export const fetchProducts = async (options: ProductFilterOptions = {}): Promise<Product[]> => {
  try {
    let query = supabase
      .from('products')
      .select('*');

    // Apply category filter
    if (options.category) {
      query = query.eq('category', options.category);
    }

    // Apply categories filter (multiple categories)
    if (options.categories && options.categories.length > 0) {
      query = query.in('category', options.categories);
    }

    // Apply subcategory filter
    if (options.subcategory) {
      query = query.eq('subcategory', options.subcategory);
    }

    // Apply search filter
    if (options.search) {
      query = query.ilike('name', `%${options.search}%`);
    }

    // Apply featured filter
    if (options.featured !== undefined) {
      query = query.eq('is_featured', options.featured);
    }

    // Apply price range filter
    if (options.minPrice !== undefined) {
      query = query.gte('price', options.minPrice);
    }
    if (options.maxPrice !== undefined) {
      query = query.lte('price', options.maxPrice);
    }

    // Apply materials filter
    if (options.materials && options.materials.length > 0) {
      query = query.in('material', options.materials);
    }

    // Apply colors filter
    if (options.colors && options.colors.length > 0) {
      query = query.contains('colors', options.colors);
    }

    // Apply sorting
    if (options.sort) {
      switch (options.sort) {
        case 'price-asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price-desc':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }
    }

    // Apply limit if specified
    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    if (!data) {
      return [];
    }

    return data.map(mapDatabaseProductToAppProduct);
  } catch (error) {
    console.error('Error in fetchProducts:', error);
    throw error;
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

export const fetchProductsByCategory = async (categoryName: string, sortBy = 'newest'): Promise<Product[]> => {
  try {
    console.log('fetchProductsByCategory called with:', categoryName);
    const products = await fetchProducts({
      categories: [categoryName],
      sort: sortBy
    });
    console.log('Fetched products:', products);
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
    console.error('Error fetching Trending products:', error);
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
        subcategory: product.subcategory,
        material: product.material,
        dimensions: product.dimensions,
        images: product.images,
        image_nobg: product.image_nobg,
        stock: product.stock || 0,
        is_featured: product.featured || false,
        is_new: product.new || false,
        discount: product.discount || 0,
        colors: product.colors || [],
        sizes: product.sizes || [],
        weight: product.weight,
        assembly: product.assembly,
        warranty: product.warranty
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
