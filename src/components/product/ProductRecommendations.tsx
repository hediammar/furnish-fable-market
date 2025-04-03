
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchRelatedProducts } from '@/services/productService';
import ProductCard from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductRecommendationsProps {
  productId: string;
  category: string;
}

const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({ 
  productId, 
  category 
}) => {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['relatedProducts', productId, category],
    queryFn: () => fetchRelatedProducts(productId, category),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="w-full h-48 rounded-lg" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 border-t border-border">
      <div className="container-custom">
        <h2 className="font-serif text-2xl mb-8">You Might Also Like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductRecommendations;
