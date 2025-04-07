
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface NewsletterSubscriber {
  id?: string;
  email: string;
  first_name?: string;
  created_at?: string;
  subscribed_at?: string;
}

export interface Newsletter {
  id?: string;
  subject: string;
  content: any; // Change from string to any to match jsonb type in Supabase
  preheader?: string;
  sent_at?: string;
  created_at?: string;
  updated_at?: string;
}

export const subscribeToNewsletter = async (subscriber: { email: string, first_name?: string }): Promise<boolean> => {
  try {
    console.log('Subscribing to newsletter:', subscriber);
    
    // Check if email already exists
    const { data: existingSubscriber, error: checkError } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('email', subscriber.email)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
      console.error('Error checking existing subscriber:', checkError);
      throw checkError;
    }
    
    if (existingSubscriber) {
      console.log('Email already subscribed:', subscriber.email);
      toast.success('You are already subscribed to our newsletter!');
      return false;
    }
    
    // Add new subscriber with proper subscription date
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert([{
        ...subscriber,
        subscribed_at: new Date().toISOString()
      }]);
      
    if (error) {
      console.error('Error subscribing to newsletter:', error);
      throw error;
    }
    
    console.log('Successfully subscribed to newsletter');
    toast.success('Thank you for subscribing to our newsletter!');
    return true;
  } catch (error) {
    console.error('Error in subscribeToNewsletter:', error);
    toast.error('Failed to subscribe to newsletter. Please try again.');
    return false;
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
    console.log('Creating newsletter:', newsletter);
    
    const { data, error } = await supabase
      .from('newsletters')
      .insert([{
        ...newsletter,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();
      
    if (error) {
      console.error('Error creating newsletter:', error);
      throw error;
    }
    
    console.log('Newsletter created successfully:', data?.[0]);
    return data?.[0] as Newsletter || null;
  } catch (error) {
    console.error('Error in createNewsletter:', error);
    throw error;
  }
};

export const sendNewsletter = async (newsletterId: string): Promise<void> => {
  try {
    console.log('Sending newsletter:', newsletterId);
    
    const { data, error } = await supabase
      .functions.invoke('send-newsletter', {
        body: { newsletterId }
      });
    
    console.log('Newsletter send response:', data);
    
    if (error) {
      console.error('Error sending newsletter:', error);
      throw error;
    }
    
    // Update the newsletter with the sent date
    await supabase
      .from('newsletters')
      .update({ sent_at: new Date().toISOString() })
      .eq('id', newsletterId);
    
    toast.success('Newsletter sent successfully!');
  } catch (error) {
    console.error('Error in sendNewsletter:', error);
    toast.error('Failed to send newsletter. Please try again.');
    throw error;
  }
};
