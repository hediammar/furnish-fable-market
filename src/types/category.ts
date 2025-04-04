
export interface Category {
  id: string;
  created_at: string | null;
  name: string;
  description?: string;
  image?: string;
  updated_at?: string;
  productCount?: number;
}
