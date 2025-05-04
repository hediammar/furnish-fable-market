import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';

interface ProductDetailsProps {
  product: Product;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  return (
    <section className="py-16 px-4 md:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <h2 className="text-3xl md:text-4xl font-serif">{product.name}</h2>
          
          <p className="text-lg text-muted-foreground">{product.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Material</h3>
              <p className="text-muted-foreground">{product.material}</p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Dimensions</h3>
              <p className="text-muted-foreground">{product.dimensions}</p>
            </div>
          </div>
          
          {product.designer && (
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Design</h3>
              <p className="text-muted-foreground">
                {product.designer}
                {product.year && `, ${product.year}`}
              </p>
            </div>
          )}
          
          <Button
            size="lg"
            className="mt-8"
            onClick={() => {/* Add to cart logic */}}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductDetails; 