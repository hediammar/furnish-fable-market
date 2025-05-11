import { supabase } from '@/integrations/supabase/client';

export interface Material {
  id: string;
  name: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface Textile {
  id: string;
  name: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export const fetchMaterials = async (): Promise<Material[]> => {
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .order('name');

  if (error) {
    throw error;
  }

  return data || [];
};

export const fetchTextiles = async (): Promise<Textile[]> => {
  const { data, error } = await supabase
    .from('textiles')
    .select('*')
    .order('name');

  if (error) {
    throw error;
  }

  return data || [];
};

export const uploadMaterialImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `images/materials/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('material')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('material')
    .getPublicUrl(filePath);

  return publicUrl;
};

export const uploadTextileImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `images/textiles/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('textile')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('textile')
    .getPublicUrl(filePath);

  return publicUrl;
}; 