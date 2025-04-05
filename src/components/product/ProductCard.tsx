
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types/product';
import { useLanguage } from '@/context/LanguageContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { language } = useLanguage();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <div className="group bg-white rounded-md overflow-hidden card-shadow animate-scale-in">
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <Link to={`/product/${product.id}`}>
          <img 
            src={product.images[0]} 
            alt={product.name}
            className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Overlay with quick actions */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
            <button 
              onClick={handleAddToCart}
              className="bg-white text-furniture-brown hover:bg-furniture-taupe hover:text-white p-3 rounded-full transition-colors"
            >
              <ShoppingCart size={20} />
            </button>
            <Link 
              to={`/product/${product.id}`} 
              className="bg-white text-furniture-brown hover:bg-furniture-taupe hover:text-white p-3 rounded-full transition-colors"
            >
              <Eye size={20} />
            </Link>
          </div>
        </Link>
        
        {/* Tags */}
        <div className="absolute top-3 left-3 flex space-x-2">
          {product.new && (
            <span className="bg-furniture-teal text-white text-xs font-bold px-2 py-1 rounded">
              {language === 'fr' ? 'NOUVEAU' : 'NEW'}
            </span>
          )}
          {product.featured && (
            <span className="bg-furniture-orange text-white text-xs font-bold px-2 py-1 rounded">
              {language === 'fr' ? 'EN VEDETTE' : 'FEATURED'}
            </span>
          )}
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="font-medium text-lg mb-1 text-furniture-brown hover:text-furniture-taupe transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            {product.category}
          </p>
          <div className="flex justify-between items-center">
            <span className="font-semibold">{language === 'fr' ? 'Prix sur demande' : 'Price on request'}</span>
            {!product.inStock && (
              <span className="text-destructive text-sm">{language === 'fr' ? 'Rupture de stock' : 'Out of stock'}</span>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
