import { Json } from '@/integrations/supabase/types';

export interface Partner {
  id: string;
  name: string;
  logo: string;
  website?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  projects?: Project[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  images: string[];
  products: string[];
  project_category?: 'All' | 'Hotels' | 'Villas' | 'Restaurants' | 'Coffee shops';
}

// Define database schema types for type safety with Supabase
export interface PartnerDB {
  id: string;
  name: string;
  logo: string;
  website?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}
