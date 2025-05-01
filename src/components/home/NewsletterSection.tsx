
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { subscribeToNewsletter } from '@/services/newsletterService';
import { useToast } from '@/hooks/use-toast';
import { Mail, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    try {
      await subscribeToNewsletter({ email });
      setIsSuccess(true);
      setEmail('');
      toast({
        title: t('thanks'),
        description: "Vous êtes maintenant abonné à notre newsletter.",
      });
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-20 bg-muted">
      <div className="container-custom max-w-4xl">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl md:text-4xl mb-4 font-light tracking-wide">{t('newsletter')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('subscribeToNewsletter')}
          </p>
        </div>
        
        <div className="max-w-lg mx-auto">
          {isSuccess ? (
            <div className="text-center py-8 px-6 bg-green-50 rounded-lg border border-green-100 animate-fade-in">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('thanks')}</h3>
              <p className="text-gray-600">Vous êtes maintenant abonné à notre newsletter.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-3">
              <div className="flex-grow relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  type="email"
                  placeholder={t('yourEmail')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 border-furniture-taupe/20 focus:border-furniture-taupe"
                  required
                />
              </div>
              <Button 
                type="submit"
                className="bg-[#d2ac35] hover:bg-black"
                disabled={isLoading}
              >
                {isLoading ? "..." : t('subscribe')}
              </Button>
            </form>
          )}
          
          <p className="text-xs text-center mt-4 text-muted-foreground">
            En vous abonnant, vous acceptez notre politique de confidentialité et consentez à recevoir des emails marketing.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
