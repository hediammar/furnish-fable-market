
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { fetchProducts } from '@/services/productService';
import { Product } from '@/types/product';
import ProductCard from '@/components/product/ProductCard';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from '@/hooks/use-debounce';

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchQuery.trim()) {
        setProducts([]);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        const searchResults = await fetchProducts({ search: debouncedSearchQuery });
        setProducts(searchResults);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to fetch search results. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    performSearch();
  }, [debouncedSearchQuery]);
  
  useEffect(() => {
    if (debouncedSearchQuery) {
      setSearchParams({ q: debouncedSearchQuery });
    } else {
      setSearchParams({});
    }
  }, [debouncedSearchQuery, setSearchParams]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // The search is already handled by the useEffect with debounce
  };

  return (
    <>
      <Helmet>
        <title>Search Products | Meubles Karim</title>
        <meta name="description" content="Search our collection of premium furniture for your home." />
      </Helmet>
      
      <main className="py-12">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-serif text-3xl font-medium mb-8 text-center">Search Our Collection</h1>
            
            <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
              <div className="relative flex-grow">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  type="search"
                  placeholder="Search for furniture by name, category, or material..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
            
            {isLoading && (
              <div className="text-center py-12">
                <Loader2 className="animate-spin h-8 w-8 mx-auto text-furniture-brown" />
                <p className="mt-2 text-muted-foreground">Searching for products...</p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
                {error}
              </div>
            )}
            
            {!isLoading && !error && debouncedSearchQuery && (
              <>
                <div className="mb-6">
                  <p className="text-muted-foreground">
                    {products.length === 0 
                      ? `No products found for "${debouncedSearchQuery}"` 
                      : `Found ${products.length} product${products.length !== 1 ? 's' : ''} for "${debouncedSearchQuery}"`}
                  </p>
                </div>
                
                {products.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </>
            )}
            
            {!debouncedSearchQuery && !isLoading && (
              <div className="text-center py-12">
                <div className="mb-4">
                  <SearchIcon className="h-16 w-16 mx-auto text-muted-foreground opacity-30" />
                </div>
                <h3 className="text-lg font-medium mb-2">Start Searching</h3>
                <p className="text-muted-foreground">
                  Enter a keyword to search for products by name, category or material.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Search;
