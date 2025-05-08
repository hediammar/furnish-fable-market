import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { fetchCategories } from '@/services/categoryService';
import { Category } from '@/types/category';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { subscribeToNewsletter } from '@/services/newsletterService';
import { useToast } from '@/hooks/use-toast';

const gold = 'text-[#D4AF37]';
const goldBorder = 'border-[#D4AF37]';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();
  const [categories, setCategories] = useState<Category[]>([]);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await fetchCategories();
        setCategories(result);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      const result = await subscribeToNewsletter({ email });
      if (result) {
        setIsSuccess(true);
        setEmail('');
        toast({
          title: t('thanks'),
          description: "Vous êtes maintenant abonné à notre newsletter.",
        });
      }
    } catch (error) {
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
    <footer className="bg-[#000000] text-white pt-16 pb-8 font-sans">
      {/* Logo and name */}
      <div className="flex flex-col items-center mb-12">
        <span className="text-4xl font-serif font-semibold tracking-widest mb-2">Meubles Karim</span>
        <div className={`${gold} text-3xl mb-2`}>★★★★★</div>
      </div>
      {/* Main columns */}
      <div className="container-custom mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        {/* Quick Links */}
        <div>
          <h4 className="text-xl font-serif font-semibold mb-6 tracking-wide">{t('quickLinks')}</h4>
          <ul className="space-y-3 text-base">
            <li>
              <Link to="/" className="hover:text-[#D4AF37] transition-colors">{t('home')}</Link>
            </li>
            <li>
              <Link to="/products" className="hover:text-[#D4AF37] transition-colors">{t('products')}</Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-[#D4AF37] transition-colors">{t('about')}</Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-[#D4AF37] transition-colors">{t('contact')}</Link>
            </li>
            {/* Dynamic categories as extra links */}
            {categories.slice(0, 2).map((category) => (
              <li key={category.id}>
                <Link to={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-[#D4AF37] transition-colors">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* Contacts */}
        <div>
          <h4 className="text-xl font-serif font-semibold mb-6 tracking-wide">{t('contactUs')}</h4>
          <ul className="space-y-5 text-base">
            <li className="flex items-center gap-3">
              <Phone size={20} className={gold} />
              <span> (+216) 72 260 360 </span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={20} className={gold} />
              <span>contactmkarim@gmail.com</span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin size={20} className={gold} />
              <span>Route Hammamet Nord vers Nabeul,<br />Hammamet, Tunisia, 8050</span>
            </li>
          </ul>
        </div>
        {/* Newsletter */}
        <div>
          <h4 className="text-xl font-serif font-semibold mb-6 tracking-wide">{t('subscribeToNewsletter') || 'Abonnez-vous à notre newsletter'}</h4>
          {isSuccess ? (
            <div className="text-center py-8 px-6 bg-green-50/10 rounded-lg border border-green-100 animate-fade-in">
              <div className="flex justify-center mb-2"><Mail className="h-8 w-8 text-green-400" /></div>
              <h3 className="text-lg font-medium text-green-200 mb-2">{t('thanks')}</h3>
              <p className="text-green-100">{t('subscriptionSuccess') || 'Vous êtes maintenant abonné à notre newsletter.'}</p>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-4">
              <label htmlFor="newsletter-email" className="text-base mb-1">{t('email')}</label>
              <Input
                id="newsletter-email"
                type="email"
                placeholder="exemple@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={`bg-transparent border ${goldBorder} rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition-all`}
                autoComplete="off"
                required
                disabled={isLoading}
              />
              <Button
                type="submit"
                className={`mt-2 border ${goldBorder} ${gold} rounded px-6 py-2 font-semibold uppercase tracking-wider hover:bg-[#D4AF37] hover:text-black transition-all`}
                disabled={isLoading}
              >
                {isLoading ? '...' : (t('subscribe') || "S'abonner")}
              </Button>
            </form>
          )}
          {/* Social icons */}
          <div className="flex gap-6 mt-8">
            <a href="https://facebook.com/MeublesKarim" className="hover:scale-110 transition-transform" aria-label="Facebook">
              <Facebook size={24} className={gold} />
            </a>
            <a href="https://www.instagram.com/meubles.karim/" className="hover:scale-110 transition-transform" aria-label="Instagram">
              <Instagram size={24} className={gold} />
            </a>
          </div>
        </div>
      </div>
      {/* Bottom bar */}
      <div className="border-t border-[#2d2923] pt-6 mt-8 text-center text-sm text-gray-400 flex flex-col md:flex-row justify-between items-center gap-2 px-4">
        <span>&copy; {currentYear} Meubles Karim. Tous droits réservés.</span>
        <span className="text-xs">Web design and Development by <span className={gold}>AWM</span></span>
      </div>
    </footer>
  );
};

export default Footer;
