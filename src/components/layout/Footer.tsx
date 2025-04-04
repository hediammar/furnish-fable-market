
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white pt-20 pb-10">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Info */}
          <div className="space-y-6">
            <h3 className="font-serif text-2xl text-white/95">Meubles Karim</h3>
            <p className="text-gray-300 leading-relaxed">
              Les meilleures meubles pour votre maison avec une qualité garantie et un design moderne.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com/MeublesKarim" className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all duration-300 transform hover:scale-110" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="https://instagram.com/meubles_karim" className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all duration-300 transform hover:scale-110" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="https://twitter.com/MeublesKarim" className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all duration-300 transform hover:scale-110" aria-label="Twitter">
                <Twitter size={18} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-xl font-medium text-white/95">Liens Rapides</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-300 hover:text-furniture-taupe transition-colors inline-block py-1">Accueil</Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-furniture-taupe transition-colors inline-block py-1">Produits</Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-300 hover:text-furniture-taupe transition-colors inline-block py-1">Catégories</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-furniture-taupe transition-colors inline-block py-1">À Propos</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-furniture-taupe transition-colors inline-block py-1">Contact</Link>
              </li>
            </ul>
          </div>
          
          {/* Categories */}
          <div className="space-y-6">
            <h4 className="text-xl font-medium text-white/95">Catégories</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/category/salon" className="text-gray-300 hover:text-furniture-taupe transition-colors inline-block py-1">Salon</Link>
              </li>
              <li>
                <Link to="/category/chambre" className="text-gray-300 hover:text-furniture-taupe transition-colors inline-block py-1">Chambre à coucher</Link>
              </li>
              <li>
                <Link to="/category/salle-a-manger" className="text-gray-300 hover:text-furniture-taupe transition-colors inline-block py-1">Salle à manger</Link>
              </li>
              <li>
                <Link to="/category/bureau" className="text-gray-300 hover:text-furniture-taupe transition-colors inline-block py-1">Bureau</Link>
              </li>
              <li>
                <Link to="/category/exterieur" className="text-gray-300 hover:text-furniture-taupe transition-colors inline-block py-1">Extérieur</Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div className="space-y-6">
            <h4 className="text-xl font-medium text-white/95">Contactez-nous</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin size={18} className="mr-3 mt-1 flex-shrink-0 text-furniture-taupe" />
                <span className="text-gray-300">Route de Sousse Km 4,<br />Sfax 3052, Tunisie</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-3 flex-shrink-0 text-furniture-taupe" />
                <span className="text-gray-300">(+216) 74 415 415</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-3 flex-shrink-0 text-furniture-taupe" />
                <a href="mailto:contact@meubleskarim.com" className="text-gray-300 hover:text-furniture-taupe transition-colors">
                  contact@meubleskarim.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-gray-700/50 text-sm text-gray-400">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {currentYear} Meubles Karim. Tous droits réservés.</p>
            <div className="mt-4 md:mt-0">
              <ul className="flex space-x-6">
                <li>
                  <Link to="/privacy-policy" className="hover:text-furniture-taupe transition-colors">Politique de confidentialité</Link>
                </li>
                <li>
                  <Link to="/terms-of-service" className="hover:text-furniture-taupe transition-colors">Conditions d'utilisation</Link>
                </li>
                <li>
                  <Link to="/shipping-policy" className="hover:text-furniture-taupe transition-colors">Politique de livraison</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
