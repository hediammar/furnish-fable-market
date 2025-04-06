
import { supabase } from '@/integrations/supabase/client';
import { Partner } from '@/types/partner';
import { toast } from 'sonner';

export const fetchPartners = async (): Promise<Partner[]> => {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching partners:', error);
    throw error;
  }
  
  return data || [];
};

export const fetchPartnerById = async (id: string): Promise<Partner> => {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching partner:', error);
    throw error;
  }
  
  return data;
};

export const createPartner = async (partner: Omit<Partner, 'id' | 'created_at' | 'updated_at'>, logoFile?: File): Promise<Partner> => {
  try {
    let logoUrl = partner.logo;
    
    // If a file was provided, upload it to storage first
    if (logoFile) {
      console.log('Uploading logo file:', logoFile.name);
      
      // Check if bucket exists, if not we don't try to create it as we already did in the SQL migration
      const { data: buckets } = await supabase.storage.listBuckets();
      const partnersBucketExists = buckets?.some(bucket => bucket.name === 'partners');
      
      if (!partnersBucketExists) {
        console.log('Partners bucket does not exist, using placeholder logo');
        toast.error('Storage bucket not available. Using placeholder logo instead.');
        logoUrl = 'https://via.placeholder.com/300x150?text=Partner+Logo';
      } else {
        // Generate a unique file name using timestamp and random string
        const timestamp = new Date().getTime();
        const randomString = Math.random().toString(36).substring(2, 10);
        const fileExtension = logoFile.name.split('.').pop();
        const fileName = `${timestamp}-${randomString}.${fileExtension}`;
        
        // Use a try-catch inside the main try block to handle storage errors gracefully
        try {
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('partners')
            .upload(`logos/${fileName}`, logoFile, {
              cacheControl: '3600',
              upsert: false
            });
          
          if (uploadError) {
            throw uploadError;
          }
          
          // Get the public URL for the uploaded file
          const { data: urlData } = await supabase.storage
            .from('partners')
            .getPublicUrl(`logos/${fileName}`);
          
          logoUrl = urlData.publicUrl;
          console.log('Logo uploaded successfully:', logoUrl);
        } catch (storageError) {
          console.error('Error in logo upload:', storageError);
          toast.error('Could not upload logo. Using placeholder instead.');
          logoUrl = 'https://via.placeholder.com/300x150?text=Partner+Logo';
        }
      }
    }
    
    // Create the partner record with the logo URL
    const { data, error } = await supabase
      .from('partners')
      .insert([{
        ...partner,
        logo: logoUrl
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating partner:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Create partner error:', error);
    throw error;
  }
};

export const updatePartner = async (id: string, partner: Partial<Partner>, logoFile?: File): Promise<Partner> => {
  try {
    let logoUrl = partner.logo;
    
    // If a file was provided, upload it to storage first
    if (logoFile) {
      // Generate a unique file name
      const timestamp = new Date().getTime();
      const randomString = Math.random().toString(36).substring(2, 10);
      const fileExtension = logoFile.name.split('.').pop();
      const fileName = `${timestamp}-${randomString}.${fileExtension}`;
      
      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('partners')
          .upload(`logos/${fileName}`, logoFile, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (uploadError) {
          throw uploadError;
        }
        
        // Get the public URL for the uploaded file
        const { data: urlData } = await supabase.storage
          .from('partners')
          .getPublicUrl(`logos/${fileName}`);
        
        logoUrl = urlData.publicUrl;
      } catch (storageError) {
        console.error('Error uploading logo:', storageError);
        toast.error('Could not upload new logo. Keeping existing one.');
      }
    }
    
    // Update the partner record
    const { data, error } = await supabase
      .from('partners')
      .update({
        ...partner,
        ...(logoUrl ? { logo: logoUrl } : {})
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating partner:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Update partner error:', error);
    throw error;
  }
};

export const deletePartner = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('partners')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting partner:', error);
    throw error;
  }
};
