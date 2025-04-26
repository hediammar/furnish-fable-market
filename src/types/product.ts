export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  material?: string;
  dimensions?: string;
  inStock: boolean;
  stock?: number;
  featured?: boolean;
  new?: boolean;
  discount?: number;
  formattedPrice?: string; // Added formattedPrice property
  colors?: string[];
  sizes?: string[];
  weight?: string;
  assembly?: string;
  warranty?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}
