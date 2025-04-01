
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
  
  // Transform the data to match our Product interface
  const products = data.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description || '',
    price: item.price,
    discount: item.discount,
    images: item.images || [],
    category: item.category || '',
    material: item.material,
    dimensions: item.dimensions,
    inStock: item.stock ? item.stock > 0 : false,
    stock: item.stock,
    featured: item.is_featured,
    new: item.is_new
  }));
  
  return products as Product[];
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
  
  // Transform to match our Product interface
  const product = {
    id: data.id,
    name: data.name,
    description: data.description || '',
    price: data.price,
    discount: data.discount,
    images: data.images || [],
    category: data.category || '',
    material: data.material,
    dimensions: data.dimensions,
    inStock: data.stock ? data.stock > 0 : false,
    stock: data.stock,
    featured: data.is_featured,
    new: data.is_new
  };
  
  return product as Product;
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
  // Convert from our frontend model to database model
  const dbProduct = {
    name: product.name,
    description: product.description,
    price: product.price,
    discount: product.discount,
    images: product.images,
    category: product.category,
    material: product.material,
    dimensions: product.dimensions,
    stock: product.stock !== undefined ? product.stock : (product.inStock ? 10 : 0), // Default stock if not provided
    is_featured: product.featured,
    is_new: product.new
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
  
  // Transform back to our Product interface
  const createdProduct = {
    id: data.id,
    name: data.name,
    description: data.description || '',
    price: data.price,
    discount: data.discount,
    images: data.images || [],
    category: data.category || '',
    material: data.material,
    dimensions: data.dimensions,
    inStock: data.stock ? data.stock > 0 : false,
    stock: data.stock,
    featured: data.is_featured,
    new: data.is_new
  };
  
  return createdProduct as Product;
};

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  // Convert from our frontend model to database model
  const dbUpdates: any = {};
  
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.price !== undefined) dbUpdates.price = updates.price;
  if (updates.discount !== undefined) dbUpdates.discount = updates.discount;
  if (updates.images !== undefined) dbUpdates.images = updates.images;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.material !== undefined) dbUpdates.material = updates.material;
  if (updates.dimensions !== undefined) dbUpdates.dimensions = updates.dimensions;
  if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
  if (updates.inStock !== undefined && updates.stock === undefined) {
    dbUpdates.stock = updates.inStock ? 10 : 0; // Default stock if only inStock is provided
  }
  if (updates.featured !== undefined) dbUpdates.is_featured = updates.featured;
  if (updates.new !== undefined) dbUpdates.is_new = updates.new;

  const { data, error } = await supabase
    .from('products')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }
  
  // Transform back to our Product interface
  const updatedProduct = {
    id: data.id,
    name: data.name,
    description: data.description || '',
    price: data.price,
    discount: data.discount,
    images: data.images || [],
    category: data.category || '',
    material: data.material,
    dimensions: data.dimensions,
    inStock: data.stock ? data.stock > 0 : false,
    stock: data.stock,
    featured: data.is_featured,
    new: data.is_new
  };
  
  return updatedProduct as Product;
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
