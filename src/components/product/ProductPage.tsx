import React, { useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '@/types/product';
import ProductDetails from './ProductDetails';
import SimilarProducts from './SimilarProducts';

interface ProductPageProps {
  product: Product;
  similarProducts: Product[];
}

const ProductPage: React.FC<ProductPageProps> = ({ product, similarProducts }) => {
  const detailsRef = useRef<HTMLDivElement>(null);

  const scrollToDetails = () => {
    detailsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen w-full">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${product.images[0]})` }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative h-full flex flex-col items-center justify-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-serif text-white text-center px-4"
          >
            {product.name}
          </motion.h1>
          
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            onClick={scrollToDetails}
            className="absolute bottom-8 text-white animate-bounce"
          >
            <ChevronDown size={32} />
          </motion.button>
        </div>
      </section>

      {/* Product Details Section */}
      <div ref={detailsRef}>
        <ProductDetails product={product} />
      </div>

      {/* Similar Products Section */}
      <SimilarProducts products={similarProducts} />
    </div>
  );
};

export default ProductPage; 