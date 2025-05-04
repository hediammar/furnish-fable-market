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

// Add this at the end of the file:
export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  description?: string;
}