
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  material?: string;
  dimensions?: string; // Changed from object to string to match Supabase schema
  inStock: boolean;
  stock?: number; // Added to match what's used in ProductsManagement.tsx
  featured?: boolean;
  new?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
