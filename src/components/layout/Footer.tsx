
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="font-serif text-xl mb-4">Meubles Karim</h3>
            <p className="text-gray-300 mb-4">
              Les meilleures meubles pour votre maison avec une qualité garantie et un design moderne.
            </p>
            <div className="flex space-x-3">
              <a href="https://facebook.com/MeublesKarim" className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="https://instagram.com/meubles_karim" className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="https://twitter.com/MeublesKarim" className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors" aria-label="Twitter">
                <Twitter size={18} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-medium mb-4">Liens Rapides</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">Accueil</Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white transition-colors">Produits</Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-300 hover:text-white transition-colors">Catégories</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">À Propos</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link>
              </li>
            </ul>
          </div>
          
          {/* Categories */}
          <div>
            <h4 className="text-lg font-medium mb-4">Catégories</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/category/living-room" className="text-gray-300 hover:text-white transition-colors">Salon</Link>
              </li>
              <li>
                <Link to="/category/bedroom" className="text-gray-300 hover:text-white transition-colors">Chambre à coucher</Link>
              </li>
              <li>
                <Link to="/category/dining" className="text-gray-300 hover:text-white transition-colors">Salle à manger</Link>
              </li>
              <li>
                <Link to="/category/office" className="text-gray-300 hover:text-white transition-colors">Bureau</Link>
              </li>
              <li>
                <Link to="/category/outdoor" className="text-gray-300 hover:text-white transition-colors">Extérieur</Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="text-lg font-medium mb-4">Contactez-nous</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin size={18} className="mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-300">Route de Sousse Km 4,<br />Sfax 3052, Tunisie</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-3 flex-shrink-0" />
                <span className="text-gray-300">(+216) 74 415 415</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-3 flex-shrink-0" />
                <a href="mailto:contact@meubleskarim.com" className="text-gray-300 hover:text-white transition-colors">
                  contact@meubleskarim.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-sm text-gray-400">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {currentYear} Meubles Karim. Tous droits réservés.</p>
            <div className="mt-4 md:mt-0">
              <ul className="flex space-x-6">
                <li>
                  <Link to="/privacy-policy" className="hover:text-white transition-colors">Politique de confidentialité</Link>
                </li>
                <li>
                  <Link to="/terms-of-service" className="hover:text-white transition-colors">Conditions d'utilisation</Link>
                </li>
                <li>
                  <Link to="/shipping-policy" className="hover:text-white transition-colors">Politique de livraison</Link>
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
