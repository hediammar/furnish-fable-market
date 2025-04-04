
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { subscribe } from '@/services/newsletterService';

const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address.',
        variant: 'destructive',
      });
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await subscribe(email, firstName || undefined);
      
      toast({
        title: 'Thank you for subscribing!',
        description: 'You will now receive our latest updates and offers.',
      });
      
      setEmail('');
      setFirstName('');
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      toast({
        title: 'Subscription Failed',
        description: 'There was an error subscribing to the newsletter. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-furniture-brown text-white">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-medium mb-4">Join Our Newsletter</h2>
          <p className="text-white/80 mb-8">
            Subscribe to receive updates on new arrivals, special offers, and design inspiration.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              type="text"
              placeholder="Your first name (optional)"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-grow bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
              <Button 
                type="submit" 
                className="bg-white text-furniture-brown hover:bg-white/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  'Subscribing...'
                ) : (
                  <>
                    Subscribe <Send size={16} className="ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
