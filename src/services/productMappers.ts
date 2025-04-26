import { Product } from '@/types/product';
import { formatPrice } from '@/utils/currencyUtils';

// Map database product to our app's Product type
export const mapDatabaseProductToAppProduct = (dbProduct: any): Product => {
  // Calculate if product is in stock
  const inStock = dbProduct.stock !== null && dbProduct.stock > 0;
  
  // Calculate final price after discount
  const finalPrice = dbProduct.discount 
    ? dbProduct.price * (1 - dbProduct.discount / 100)
    : dbProduct.price;
  
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description || '',
    price: dbProduct.price,
    images: dbProduct.images || [dbProduct.image].filter(Boolean) || [],
    category: dbProduct.category || '',
    material: dbProduct.material,
    dimensions: dbProduct.dimensions,
    inStock: inStock,
    stock: dbProduct.stock || 0,
    featured: dbProduct.is_featured || false,
    new: dbProduct.is_new || false,
    discount: dbProduct.discount || 0,
    formattedPrice: formatPrice(finalPrice),
    colors: dbProduct.colors || [],
    sizes: dbProduct.sizes || [],
    weight: dbProduct.weight,
    assembly: dbProduct.assembly,
    warranty: dbProduct.warranty
  };
};
