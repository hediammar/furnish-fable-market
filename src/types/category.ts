export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  created_at?: string | null;
  updated_at?: string;
  productCount?: number;
  slug?: string;
}
