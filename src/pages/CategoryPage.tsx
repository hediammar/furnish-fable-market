
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { fetchProductsByCategory, fetchCategoryById } from '@/services/productService';
import ProductCard from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CategoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const [sort, setSort] = useState('newest');
  
  // Fetch category information
  const { 
    data: category,
    isLoading: categoryLoading,
    error: categoryError
  } = useQuery({
    queryKey: ['category', id],
    queryFn: () => fetchCategoryById(id as string),
    enabled: !!id
  });
  
  // Fetch products for the category
  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError
  } = useQuery({
    queryKey: ['categoryProducts', id, sort],
    queryFn: () => fetchProductsByCategory(id as string, sort),
    enabled: !!id
  });
  
  // Format for meta title and description
  const metaTitle = category ? `${category.name} | Meubles Karim` : 'Category | Meubles Karim';
  const metaDescription = category ? 
    `Explore our ${category.name} collection. Quality furniture for your home at Meubles Karim.` : 
    'Browse our furniture collections by category at Meubles Karim.';
  
  if (categoryLoading || productsLoading) {
    return <CategorySkeleton />;
  }
  
  if (categoryError || productsError || !category) {
    return (
      <div className="container-custom py-16 text-center">
        <h2 className="text-2xl font-medium mb-4">Category Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The category you're looking for doesn't exist or has been removed.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center text-furniture-taupe hover:text-furniture-brown"
        >
          <ArrowLeft size={16} className="mr-2" /> Back to home
        </Link>
      </div>
    );
  }

  return (
    <main>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
      </Helmet>
      
      {/* Hero Section */}
      <div className="bg-muted py-16">
        <div className="container-custom text-center">
          <h1 className="font-serif text-4xl sm:text-5xl mb-4">{category.name}</h1>
          {category.description && (
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {category.description}
            </p>
          )}
        </div>
      </div>
      
      <div className="container-custom py-12">
        {/* Sorting and product count */}
        <div className="flex justify-between items-center mb-8">
          <p className="text-muted-foreground">
            {products.length} {products.length === 1 ? 'product' : 'products'}
          </p>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Products grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-lg text-muted-foreground">No products found in this category.</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/products">Browse all products</Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  );
};

const CategorySkeleton = () => {
  return (
    <>
      <div className="bg-muted py-16">
        <div className="container-custom">
          <Skeleton className="h-12 w-1/3 mx-auto mb-4" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
        </div>
      </div>
      
      <div className="container-custom py-12">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-40" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="w-full h-72 rounded-lg" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CategoryPage;
