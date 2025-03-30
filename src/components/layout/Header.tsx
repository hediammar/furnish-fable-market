
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingCart, Search, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import CartSidebar from '../cart/CartSidebar';
import { useCart } from '@/context/CartContext';

const categories = [
  { name: 'Living Room', path: '/category/living-room' },
  { name: 'Bedroom', path: '/category/bedroom' },
  { name: 'Dining', path: '/category/dining' },
  { name: 'Office', path: '/category/office' },
  { name: 'Outdoor', path: '/category/outdoor' },
  { name: 'Decor', path: '/category/decor' },
];

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cartItems } = useCart();
  
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm">
      <div className="container-custom">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="font-serif text-2xl sm:text-3xl font-bold text-furniture-brown">
            Meubles Karim
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {categories.map((category) => (
              <Link key={category.name} to={category.path} className="nav-link text-sm font-medium">
                {category.name}
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <button className="nav-link p-2" aria-label="Search">
              <Search size={20} />
            </button>
            <Link to="/account" className="nav-link p-2" aria-label="Account">
              <User size={20} />
            </Link>
            <button 
              className="nav-link p-2 relative" 
              aria-label="Cart"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart size={20} />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-furniture-orange text-white" variant="destructive">
                  {cartItemCount}
                </Badge>
              )}
            </button>
            <button
              className="md:hidden nav-link p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col space-y-4">
              {categories.map((category) => (
                <Link 
                  key={category.name} 
                  to={category.path} 
                  className="nav-link text-lg font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};

export default Header;
