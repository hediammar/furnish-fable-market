
import { supabase } from '@/integrations/supabase/client';

export interface NewsletterSubscriber {
  id?: string;
  email: string;
  first_name?: string;
  created_at?: string;
}

export interface Newsletter {
  id?: string;
  subject: string;
  content: any; // Changed from string to any to match the jsonb type in Supabase
  preheader?: string;
  sent_at?: string;
  created_at?: string;
  updated_at?: string;
}

export const subscribeToNewsletter = async (subscriber: { email: string, first_name?: string }): Promise<void> => {
  try {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert([subscriber]);
      
    if (error) {
      console.error('Error subscribing to newsletter:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in subscribeToNewsletter:', error);
    throw error;
  }
};

export const getNewsletterSubscribers = async (): Promise<NewsletterSubscriber[]> => {
  try {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching newsletter subscribers:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getNewsletterSubscribers:', error);
    return [];
  }
};

export const getNewsletters = async (): Promise<Newsletter[]> => {
  try {
    const { data, error } = await supabase
      .from('newsletters')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching newsletters:', error);
      throw error;
    }
    
    return data as Newsletter[] || [];
  } catch (error) {
    console.error('Error in getNewsletters:', error);
    return [];
  }
};

export const createNewsletter = async (newsletter: { subject: string, content: any, preheader?: string }): Promise<Newsletter | null> => {
  try {
    const { data, error } = await supabase
      .from('newsletters')
      .insert([newsletter])
      .select();
      
    if (error) {
      console.error('Error creating newsletter:', error);
      throw error;
    }
    
    return data?.[0] as Newsletter || null;
  } catch (error) {
    console.error('Error in createNewsletter:', error);
    throw error;
  }
};

export const sendNewsletter = async (newsletterId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .functions.invoke('send-newsletter', {
        body: { newsletterId }
      });
    
    if (error) {
      console.error('Error sending newsletter:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in sendNewsletter:', error);
    throw error;
  }
};
