
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define available languages
export type Language = 'fr' | 'en';

// Translations
export type TranslationKey = 
  | 'home' 
  | 'products' 
  | 'about' 
  | 'contact'
  | 'categories'
  | 'search'
  | 'cart'
  | 'checkout'
  | 'profile'
  | 'estimates'
  | 'signIn'
  | 'signOut'
  | 'addToCart'
  | 'viewDetails'
  | 'featuredProducts'
  | 'newsletter'
  | 'subscribeToNewsletter'
  | 'yourEmail'
  | 'subscribe'
  | 'thanks'
  | 'footerText'
  | 'quickLinks'
  | 'contactUs'
  | 'address'
  | 'phone'
  | 'email'
  | 'openingHours'
  | 'subscriptionSuccess';

type Translations = {
  [key in Language]: {
    [k in TranslationKey]: string;
  };
};

const translations: Translations = {
  fr: {
    home: 'Accueil',
    products: 'Produits',
    about: 'À Propos',
    contact: 'Contact',
    categories: 'Catégories',
    search: 'Recherche',
    cart: 'Panier',
    checkout: 'Commander',
    profile: 'Mon Profil',
    estimates: 'Mes Devis',
    signIn: 'Se Connecter',
    signOut: 'Se Déconnecter',
    addToCart: 'Ajouter au panier',
    viewDetails: 'Voir détails',
    featuredProducts: 'Produits en Tendance',
    newsletter: 'Newsletter',
    subscribeToNewsletter: 'Abonnez-vous à notre newsletter',
    yourEmail: 'Votre email',
    subscribe: 'S\'abonner',
    thanks: 'Merci',
    footerText: 'Les meilleures meubles pour votre maison avec une qualité garantie et un design moderne.',
    quickLinks: 'Liens Rapides',
    contactUs: 'Contactez-nous',
    address: 'Adresse',
    phone: 'Téléphone',
    email: 'Email',
    openingHours: 'Heures d\'ouverture',
    subscriptionSuccess: 'Vous êtes maintenant abonné à notre newsletter.',
  },
  en: {
    home: 'Home',
    email: 'Email',
    products: 'Products',
    about: 'About',
    contact: 'Contact',
    categories: 'Categories',
    search: 'Search',
    cart: 'Cart',
    checkout: 'Checkout',
    profile: 'My Profile',
    estimates: 'My Estimates',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    addToCart: 'Add to Cart',
    viewDetails: 'View Details',
    featuredProducts: 'Trending Products',
    newsletter: 'Newsletter',
    subscribeToNewsletter: 'Subscribe to our newsletter',
    yourEmail: 'Your email',
    subscribe: 'Subscribe',
    thanks: 'Thank you',
    footerText: 'The best furniture for your home with guaranteed quality and modern design.',
    quickLinks: 'Quick Links',
    contactUs: 'Contact Us',
    address: 'Address',
    phone: 'Phone',
    openingHours: 'Opening Hours',
    subscriptionSuccess: 'You are now subscribed to our newsletter.',
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fr');

  // Load language preference from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'fr' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Translation function
  const t = (key: TranslationKey): string => {
    return translations[language][key];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
