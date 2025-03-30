
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  material?: string;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
    unit: string;
  };
  inStock: boolean;
  featured?: boolean;
  new?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
