import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingCart, Search, User, LogOut, Package, Home, Grid, Info, Mail, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import CartSidebar from '../cart/CartSidebar';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { fetchCategories } from '@/services/categoryService';
import { Category } from '@/types/category';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '../LanguageSwitcher';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cartItems } = useCart();
  const { user, profile, signOut, isAdmin } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();
  
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await fetchCategories();
        setCategories(result);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCategories();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
      <div className="container-custom">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="font-serif text-2xl sm:text-3xl font-bold text-furniture-brown">
            Meubles <span className="font-light">Karim</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="nav-link text-sm font-medium flex items-center gap-1">
              <Home size={18} />
              <span>{t('home')}</span>
            </Link>
            
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-9 px-3 text-sm">
                    <Grid size={18} className="mr-1" />
                    {t('products')}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                      <li className="col-span-2">
                        <NavigationMenuLink asChild>
                          <Link to="/products" className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md">
                            <div className="mb-2 mt-4 text-lg font-medium">
                              {language === 'fr' ? 'Tous les produits' : 'All Products'}
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              {language === 'fr' ? 'Parcourir notre collection complète de meubles de qualité' : 'Browse our complete collection of quality furniture'}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      {categories.map((category) => (
                        <li key={category.id}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none">{category.name}</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {category.description || (language === 'fr' ? 
                                  `Meubles de qualité pour votre ${category.name.toLowerCase()}` : 
                                  `Quality furniture for your ${category.name.toLowerCase()}`)}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
            <Link to="/about" className="nav-link text-sm font-medium flex items-center gap-1">
              <Info size={18} />
              <span>{t('about')}</span>
            </Link>
            
            <Link to="/contact" className="nav-link text-sm font-medium flex items-center gap-1">
              <Mail size={18} />
              <span>{t('contact')}</span>
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            
            <Link to="/search" className="nav-link p-2" aria-label="Search">
              <Search size={20} />
            </Link>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="nav-link p-2 relative" aria-label="Account">
                    <User size={20} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white shadow-elevated">
                  <DropdownMenuLabel>
                    {language === 'fr' ? 'Mon Compte' : 'My Account'}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">{t('profile')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/appointments">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>{language === 'fr' ? 'Mes Rendez-vous' : 'My Appointments'}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/estimates">{t('estimates')}</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin">
                          <Package className="mr-2 h-4 w-4" />
                          <span>{language === 'fr' ? 'Tableau de bord admin' : 'Admin Dashboard'}</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('signOut')}</span>
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

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/"
                className="nav-link text-lg font-medium py-2 flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home size={18} />
                <span>{t('home')}</span>
              </Link>
              <Link 
                to="/products" 
                className="nav-link text-lg font-medium py-2 flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Grid size={18} />
                <span>{t('products')}</span>
              </Link>
              {categories.map((category) => (
                <Link 
                  key={category.id}
                  to={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="nav-link text-lg font-medium py-2 pl-8"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
              <Link 
                to="/about" 
                className="nav-link text-lg font-medium py-2 flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Info size={18} />
                <span>{t('about')}</span>
              </Link>
              <Link 
                to="/contact" 
                className="nav-link text-lg font-medium py-2 flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Mail size={18} />
                <span>{t('contact')}</span>
              </Link>
              {user ? (
                <>
                  <Link 
                    to="/profile" 
                    className="nav-link text-lg font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('profile')}
                  </Link>
                  <Link 
                    to="/appointments" 
                    className="nav-link text-lg font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {language === 'fr' ? 'Mes Rendez-vous' : 'My Appointments'}
                  </Link>
                  <Link 
                    to="/estimates" 
                    className="nav-link text-lg font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('estimates')}
                  </Link>
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      className="nav-link text-lg font-medium py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {language === 'fr' ? 'Tableau de bord admin' : 'Admin Dashboard'}
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
                    {t('signOut')}
                  </Button>
                </>
              ) : (
                <Link 
                  to="/auth" 
                  className="nav-link text-lg font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('signIn')}
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};

export default Header;
