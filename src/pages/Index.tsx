
import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Hero from '@/components/home/Hero';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import { Product } from '@/types/product';
import { Link } from 'react-router-dom';
import { fetchProducts } from '@/services/productService';
import { fetchCategories } from '@/services/categoryService';
import ReviewsCarousel from '@/components/home/ReviewsCarousel';
import NewsletterSection from '@/components/home/NewsletterSection';
import CategoryPreview from '@/components/home/CategoryPreview';
import { Skeleton } from '@/components/ui/skeleton';
import { Category } from '@/types/category';

const Index: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [topCategories, setTopCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState({
    products: true,
    categories: true
  });

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        const products = await fetchProducts({ featured: true });
        setFeaturedProducts(products.slice(0, 6));
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(prev => ({ ...prev, products: false }));
      }
    };

    const loadTopCategories = async () => {
      try {
        const categories = await fetchCategories();
        
        const categoryImages = [
          'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          'https://images.unsplash.com/photo-1532372576444-dda954194ad0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          'https://images.unsplash.com/photo-1486946255434-2466348c2166?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        ];
        
        const enhancedCategories = categories.slice(0, 4).map((category, index) => ({
          ...category,
          productCount: Math.floor(Math.random() * 20) + 5,
          image: categoryImages[index % categoryImages.length]
        }));
        
        setTopCategories(enhancedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(prev => ({ ...prev, categories: false }));
      }
    };

    loadFeaturedProducts();
    loadTopCategories();
  }, []);

  return (
    <main>
      <Hero />
      
      <section className="py-16">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-medium mb-4">Shop by Category</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Find the perfect pieces for every room</p>
          </div>
          
          {loading.categories ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="w-full h-80 rounded-lg" />
                  <Skeleton className="w-3/4 h-6 mx-auto" />
                  <Skeleton className="w-1/4 h-4 mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {topCategories.map((category) => (
                <CategoryPreview 
                  key={category.id}
                  category={category as any} // Use type assertion to fix TypeScript error
                />
              ))}
            </div>
          )}
          
          <div className="mt-12 text-center">
            <Link 
              to="/categories" 
              className="btn-secondary inline-flex items-center"
            >
              View All Categories <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
      </section>
      
      {loading.products ? (
        <section className="py-16 bg-muted">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-medium mb-4">Featured Collection</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Our most popular pieces, handpicked for their exceptional design and quality</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4 bg-white rounded-lg shadow-sm p-6">
                  <Skeleton className="w-full h-64 rounded-md" />
                  <Skeleton className="w-3/4 h-6" />
                  <Skeleton className="w-1/3 h-5" />
                  <Skeleton className="w-full h-4" />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <FeaturedProducts products={featuredProducts} />
      )}
      
      <ReviewsCarousel />
      
      <NewsletterSection />
    </main>
  );
};

export default Index;
