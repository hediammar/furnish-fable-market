import { Product } from '@/types/product';
import { formatPrice } from '@/utils/currencyUtils';

// Map database product to our app's Product type
export const mapDatabaseProductToAppProduct = (dbProduct: any): Product => {
  // Calculate if product is in stock
  const stockValue = Number(dbProduct.stock);
  const inStock = !isNaN(stockValue) && stockValue > 0;
  
  // Calculate final price after discount
  const finalPrice = dbProduct.discount 
    ? dbProduct.price * (1 - dbProduct.discount / 100)
    : dbProduct.price;
  
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description || '',
    price: dbProduct.price,
    image_nobg: dbProduct.image_nobg || '',
    images: dbProduct.images || [dbProduct.image].filter(Boolean) || [],
    category: dbProduct.category || '',
    subcategory: dbProduct.subcategory || '',
    material_id: dbProduct.material_id,
    textile_id: dbProduct.textile_id,
    material: dbProduct.material,
    textile: dbProduct.textile,
    dimensions: dbProduct.dimensions,
    inStock: inStock,
    stock: dbProduct.stock || 0,
    featured: dbProduct.is_featured || false,
    new: dbProduct.is_new || false,
    discount: dbProduct.discount || 0,
    formattedPrice: formatPrice(finalPrice),
    sizes: dbProduct.sizes || [],
    weight: dbProduct.weight,
    assembly: dbProduct.assembly,
    warranty: dbProduct.warranty
  };
};
