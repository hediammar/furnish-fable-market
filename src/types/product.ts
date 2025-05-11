export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_nobg: string;
  images: string[];
  category: string;
  subcategory: string;
  material_id: string;
  textile_id: string;
  dimensions: string;
  designer?: string;
  year?: string;
  inStock: boolean;
  stock?: number;
  featured?: boolean;
  new?: boolean;
  discount?: number;
  formattedPrice?: string;
  sizes?: string[];
  weight?: string;
  assembly?: string;
  warranty?: string;
  // These will be populated when fetching the product
  material?: {
    id: string;
    name: string;
    image_url: string;
  };
  textile?: {
    id: string;
    name: string;
    image_url: string;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}
