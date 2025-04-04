
import { supabase } from '@/integrations/supabase/client';

export interface Newsletter {
  id: string;
  subject: string;
  preheader: string;
  content: any[];
  sent_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  first_name?: string;
  subscribed_at: string;
}

export const saveNewsletter = async (newsletter: Omit<Newsletter, 'id' | 'created_at' | 'updated_at'>): Promise<Newsletter> => {
  const { data, error } = await supabase
    .from('newsletters')
    .insert({
      subject: newsletter.subject,
      preheader: newsletter.preheader,
      content: newsletter.content
    })
    .select('*')
    .single();
  
  if (error) {
    console.error('Error saving newsletter:', error);
    throw error;
  }
  
  return data as Newsletter;
};

export const updateNewsletter = async (id: string, newsletter: Partial<Newsletter>): Promise<Newsletter> => {
  const { data, error } = await supabase
    .from('newsletters')
    .update({
      subject: newsletter.subject,
      preheader: newsletter.preheader,
      content: newsletter.content
    })
    .eq('id', id)
    .select('*')
    .single();
  
  if (error) {
    console.error('Error updating newsletter:', error);
    throw error;
  }
  
  return data as Newsletter;
};

export const getNewsletters = async (): Promise<Newsletter[]> => {
  const { data, error } = await supabase
    .from('newsletters')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching newsletters:', error);
    throw error;
  }
  
  return (data || []) as Newsletter[];
};

export const getNewsletterById = async (id: string): Promise<Newsletter | null> => {
  const { data, error } = await supabase
    .from('newsletters')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching newsletter by ID:', error);
    throw error;
  }
  
  return data as Newsletter;
};

export const getSubscribers = async (): Promise<NewsletterSubscriber[]> => {
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('subscribed_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching newsletter subscribers:', error);
    throw error;
  }
  
  return (data || []) as NewsletterSubscriber[];
};

/**
 * Subscribe a user to the newsletter
 * @param email User email address
 * @param firstName Optional first name
 */
export const subscribe = async (email: string, firstName?: string): Promise<void> => {
  try {
    // Check if email already exists
    const { data: existingSubscribers } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', email);
    
    if (existingSubscribers && existingSubscribers.length > 0) {
      // Email already subscribed, just return
      return;
    }
    
    // Insert new subscriber
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email,
        first_name: firstName || null
      });
    
    if (error) {
      console.error('Error subscribing to newsletter:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in subscribe function:', error);
    throw error;
  }
};

export const unsubscribe = async (email: string): Promise<void> => {
  const { error } = await supabase
    .from('newsletter_subscribers')
    .delete()
    .eq('email', email);
  
  if (error) {
    console.error('Error unsubscribing from newsletter:', error);
    throw error;
  }
};

export const sendNewsletter = async (newsletterId: string): Promise<void> => {
  // This would call an edge function that actually sends the emails
  const { error } = await supabase
    .functions
    .invoke('send-newsletter', {
      body: { newsletterId }
    });
  
  if (error) {
    console.error('Error sending newsletter:', error);
    throw error;
  }
  
  // Mark the newsletter as sent
  await supabase
    .from('newsletters')
    .update({ sent_at: new Date().toISOString() })
    .eq('id', newsletterId);
};
