import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User extends SupabaseUser {
  address?: string;
  city?: string;
  zipCode?: string;
  country?: string;
} 