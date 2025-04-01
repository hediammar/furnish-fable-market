
import { Tables } from '@/integrations/supabase/types';

export type Profile = Tables<'profiles'>;

// Category type for use in CategoriesManagement.tsx
export type Category = Tables<'categories'>;
