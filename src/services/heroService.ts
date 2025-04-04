
import { supabase } from '@/integrations/supabase/client';
import { HeroContent } from '@/types/hero';

export const getHeroContent = async (page: string): Promise<HeroContent | null> => {
  // Use a type assertion to tell TypeScript this is a valid table
  const { data, error } = await supabase
    .from('hero_content')
    .select('*')
    .eq('page', page)
    .single();
  
  if (error) {
    // If no data found, don't throw an error
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching hero content:', error);
    throw error;
  }
  
  return data as HeroContent;
};

export const getAllHeroContent = async (): Promise<HeroContent[]> => {
  const { data, error } = await supabase
    .from('hero_content')
    .select('*')
    .order('page');
  
  if (error) {
    console.error('Error fetching all hero content:', error);
    throw error;
  }
  
  return (data || []) as HeroContent[];
};

export const saveHeroContent = async (content: HeroContent): Promise<HeroContent> => {
  // Check if the content already exists
  const { data: existingData } = await supabase
    .from('hero_content')
    .select('id')
    .eq('page', content.page)
    .single();
  
  let result;
  
  if (existingData) {
    // Update existing content
    result = await supabase
      .from('hero_content')
      .update({
        title: content.title,
        subtitle: content.subtitle,
        primary_button_text: content.primary_button_text,
        primary_button_link: content.primary_button_link,
        secondary_button_text: content.secondary_button_text,
        secondary_button_link: content.secondary_button_link,
        background_image: content.background_image
      })
      .eq('id', existingData.id)
      .select('*')
      .single();
  } else {
    // Insert new content
    result = await supabase
      .from('hero_content')
      .insert({
        page: content.page,
        title: content.title,
        subtitle: content.subtitle,
        primary_button_text: content.primary_button_text,
        primary_button_link: content.primary_button_link,
        secondary_button_text: content.secondary_button_text,
        secondary_button_link: content.secondary_button_link,
        background_image: content.background_image
      })
      .select('*')
      .single();
  }
  
  if (result.error) {
    console.error('Error saving hero content:', result.error);
    throw result.error;
  }
  
  return result.data as HeroContent;
};

export const uploadHeroImage = async (file: File): Promise<string> => {
  const fileName = `hero-${Date.now()}.${file.name.split('.').pop()}`;
  
  const { data, error } = await supabase.storage
    .from('hero-images')
    .upload(fileName, file);
  
  if (error) {
    console.error('Error uploading hero image:', error);
    throw error;
  }
  
  const { data: urlData } = supabase.storage
    .from('hero-images')
    .getPublicUrl(fileName);
  
  return urlData.publicUrl;
};
