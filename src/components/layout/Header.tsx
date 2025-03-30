
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingCart, Search, User, LogOut, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import CartSidebar from '../cart/CartSidebar';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

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
  const { user, profile, signOut, isAdmin } = useAuth();
  
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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
            <Link to="/products" className="nav-link text-sm font-medium">
              All Products
            </Link>
            {categories.map((category) => (
              <Link key={category.name} to={category.path} className="nav-link text-sm font-medium">
                {category.name}
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <Link to="/products" className="nav-link p-2" aria-label="Search">
              <Search size={20} />
            </Link>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="nav-link p-2 relative" aria-label="Account">
                    <User size={20} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders">My Orders</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin">
                          <Package className="mr-2 h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth" className="nav-link p-2" aria-label="Sign In">
                <User size={20} />
              </Link>
            )}
            
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
              <Link 
                to="/products" 
                className="nav-link text-lg font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                All Products
              </Link>
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
              {user ? (
                <>
                  <Link 
                    to="/profile" 
                    className="nav-link text-lg font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link 
                    to="/orders" 
                    className="nav-link text-lg font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      className="nav-link text-lg font-medium py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <Button 
                    variant="ghost" 
                    className="justify-start p-2 h-auto"
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link 
                  to="/auth" 
                  className="nav-link text-lg font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
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
