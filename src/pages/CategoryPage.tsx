import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { fetchProductsByCategory } from '@/services/productService';
import { fetchCategoryById, fetchCategories } from '@/services/categoryService';
import ProductCard from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category } from '@/types/category';

const CategoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const [sort, setSort] = useState('newest');
  const navigate = useNavigate();
  
  // Fetch all categories to check if we need to search by slug
  const { data: allCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });
  
  // Find category by ID or name/slug
  const findCategoryId = (categoryIdentifier: string, categories: Category[]) => {
    // Check if it's a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (uuidRegex.test(categoryIdentifier)) {
      return categoryIdentifier;
    }
    
    // If not a UUID, try to match by name (case insensitive)
    const category = categories?.find(cat => 
      cat.name.toLowerCase() === categoryIdentifier.toLowerCase() ||
      cat.id === categoryIdentifier
    );
    
    return category?.id;
  };
  
  // Get the proper category ID
  const categoryId = allCategories ? findCategoryId(id as string, allCategories) : null;
  
  // Fetch category information
  const { 
    data: category,
    isLoading: categoryLoading,
    error: categoryError
  } = useQuery({
    queryKey: ['category', categoryId],
    queryFn: () => categoryId ? fetchCategoryById(categoryId) : null,
    enabled: !!categoryId
  });
  
  // Fetch products for the category
  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError
  } = useQuery({
    queryKey: ['categoryProducts', categoryId, sort],
    queryFn: () => categoryId ? fetchProductsByCategory(categoryId, sort) : Promise.resolve([]),
    enabled: !!categoryId
  });
  
  // Format for meta title and description
  const metaTitle = category ? `${category.name} | Meubles Karim` : 'Catégorie | Meubles Karim';
  const metaDescription = category ? 
    `Explorez notre collection de ${category.name}. Des meubles de qualité pour votre maison chez Meubles Karim.` : 
    'Parcourez nos collections de meubles par catégorie chez Meubles Karim.';
  
  if (categoryLoading || productsLoading || (allCategories && !categoryId)) {
    return <CategorySkeleton />;
  }
  
  if (categoryError || productsError || !category) {
    return (
      <div className="container-custom py-16 text-center">
        <h2 className="text-2xl font-medium mb-4">Catégorie Introuvable</h2>
        <p className="text-muted-foreground mb-8">
          La catégorie que vous recherchez n'existe pas ou a été supprimée.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center text-furniture-taupe hover:text-furniture-brown"
        >
          <ArrowLeft size={16} className="mr-2" /> Retour à l'accueil
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
                <SelectItem value="newest">Nouveau</SelectItem>
                <SelectItem value="price-asc">Prix: Bas à Haut</SelectItem>
                <SelectItem value="price-desc">Prix: Haut à Bas</SelectItem>
                <SelectItem value="rating">Top Noté</SelectItem>
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
            <p className="text-lg text-muted-foreground">Aucun produit trouvé dans cette catégorie.</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/products">Parcourir toutes les produits</Link>
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
