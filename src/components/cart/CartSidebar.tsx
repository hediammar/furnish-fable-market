
import React from 'react';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import CartItem from './CartItem';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/context/LanguageContext';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
  const { cartItems } = useCart();
  const { language } = useLanguage();
  
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50"
          onClick={onClose}
        />
      )}
      
      {/* Cart Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Cart Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-medium text-lg flex items-center">
            <ShoppingBag size={18} className="mr-2" />
            {language === 'fr' ? `Votre Panier (${totalItems})` : `Your Cart (${totalItems})`}
          </h2>
          <button 
            className="p-2 text-muted-foreground hover:text-foreground"
            onClick={onClose}
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Cart Content */}
        <div className="h-[calc(100vh-200px)] overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <ShoppingBag size={40} className="text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">
                {language === 'fr' ? 'Votre panier est vide' : 'Your cart is empty'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {language === 'fr' 
                  ? 'Il semble que vous n\'ayez pas encore ajouté d\'articles à votre panier.' 
                  : 'Looks like you haven\'t added any items to your cart yet.'}
              </p>
              <button 
                className="btn-secondary"
                onClick={onClose}
              >
                {language === 'fr' ? 'Continuer les achats' : 'Continue Shopping'}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {cartItems.map((item) => (
                <CartItem key={item.product.id} item={item} />
              ))}
            </div>
          )}
        </div>
        
        {/* Cart Footer */}
        {cartItems.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-border">
            <div className="flex justify-between mb-4">
              <span className="font-medium">{language === 'fr' ? 'Sous-total' : 'Subtotal'}</span>
              <span className="font-medium">{language === 'fr' ? 'Prix sur demande' : 'Price on request'}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {language === 'fr' 
                ? 'Demandez une estimation pour connaître les tarifs et les délais de livraison.'
                : 'Request an estimate to get pricing and shipping times.'}
            </p>
            <div className="space-y-2">
              <Link 
                to="/checkout"
                className="btn-primary w-full flex items-center justify-center"
                onClick={onClose}
              >
                {language === 'fr' ? 'Demander une estimation' : 'Request Estimate'} <ArrowRight size={16} className="ml-2" />
              </Link>
              <button 
                className="btn-secondary w-full"
                onClick={onClose}
              >
                {language === 'fr' ? 'Continuer les achats' : 'Continue Shopping'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
