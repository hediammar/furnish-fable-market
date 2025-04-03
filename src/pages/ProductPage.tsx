
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductDetail from '@/components/product/ProductDetail';
import { Product } from '@/types/product';
import { ArrowLeft } from 'lucide-react';
import { fetchProductById } from '@/services/productService';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const productData = await fetchProductById(id);
        setProduct(productData);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast({
          title: 'Error',
          description: 'Failed to load product details. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadProduct();
  }, [id, toast]);
  
  if (loading) {
    return <ProductSkeleton />;
  }
  
  if (!product) {
    return (
      <div className="container-custom py-16 text-center">
        <h2 className="text-2xl font-medium mb-4">Product Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Link 
          to="/products" 
          className="inline-flex items-center text-furniture-brown hover:text-furniture-teal"
        >
          <ArrowLeft size={16} className="mr-2" /> Back to all products
        </Link>
      </div>
    );
  }
  
  // Breadcrumb categories
  const categories = [
    { name: 'Home', path: '/' },
    { name: product.category, path: `/category/${product.category.toLowerCase().replace(' ', '-')}` },
    { name: product.name, path: '#' }
  ];

  return (
    <main>
      {/* Breadcrumb */}
      <div className="bg-muted py-3">
        <div className="container-custom">
          <div className="flex items-center text-sm">
            {categories.map((category, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="mx-2 text-muted-foreground">/</span>}
                {index === categories.length - 1 ? (
                  <span className="text-muted-foreground">{category.name}</span>
                ) : (
                  <Link to={category.path} className="hover:text-furniture-brown text-muted-foreground">
                    {category.name}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      
      {/* Product Detail */}
      <ProductDetail product={product} />
      
      {/* Back to products link */}
      <div className="container-custom py-8">
        <Link 
          to="/products" 
          className="inline-flex items-center text-furniture-brown hover:text-furniture-teal"
        >
          <ArrowLeft size={16} className="mr-2" /> Back to all products
        </Link>
      </div>
    </main>
  );
};

const ProductSkeleton: React.FC = () => {
  return (
    <div className="container-custom py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <Skeleton className="w-full h-[500px] rounded-lg" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="w-full h-24 rounded" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="w-3/4 h-10" />
          <Skeleton className="w-1/2 h-6" />
          <Skeleton className="w-1/3 h-8" />
          <Skeleton className="w-full h-px" />
          <div className="space-y-4">
            <Skeleton className="w-1/4 h-6" />
            <Skeleton className="w-full h-24" />
          </div>
          <Skeleton className="w-full h-12" />
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
