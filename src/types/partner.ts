
import { Json } from '@/integrations/supabase/types';

export interface Partner {
  id: string;
  name: string;
  logo: string;
  website?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
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
