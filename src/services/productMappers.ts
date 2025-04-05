
import { Product } from '@/types/product';
import { formatPrice } from '@/utils/currencyUtils';

// Map database product to our app's Product type
export const mapDatabaseProductToAppProduct = (dbProduct: any): Product => {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description || '',
    price: dbProduct.price,
    images: dbProduct.images || [dbProduct.image].filter(Boolean) || [],
    category: dbProduct.category || '',
    material: dbProduct.material,
    dimensions: dbProduct.dimensions,
    inStock: dbProduct.stock > 0,
    stock: dbProduct.stock || 0,
    featured: dbProduct.is_featured || false,
    new: dbProduct.is_new || false,
    discount: dbProduct.discount || 0,
    formattedPrice: formatPrice(dbProduct.price)
  };
};
