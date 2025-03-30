
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../product/ProductCard';
import { Product } from '@/types/product';

interface FeaturedProductsProps {
  title?: string;
  subtitle?: string;
  products: Product[];
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ 
  title = "Featured Collection", 
  subtitle = "Discover our most popular pieces, carefully selected for your home",
  products 
}) => {
  return (
    <section className="py-16 bg-muted">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-medium mb-4">{title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
        </div>
        
        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {/* View All Link */}
        <div className="mt-12 text-center">
          <Link 
            to="/products" 
            className="inline-flex items-center text-furniture-brown hover:text-furniture-teal font-medium transition-colors"
          >
            View All Products <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
