
export interface Category {
  id: string;
  created_at: string | null;
  name: string;
  description?: string; // Make description optional to match database schema
  image?: string;
  updated_at?: string; // Make updated_at optional
  productCount?: number; // Add productCount for usage in CategoryPreview
}
