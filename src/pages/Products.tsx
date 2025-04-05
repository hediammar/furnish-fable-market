
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Product } from '@/types/product';
import { ProductFilterOptions, fetchProducts } from '@/services/productService';
import ProductCard from '@/components/product/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Filter, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<string>('newest');
  const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [availableMaterials, setAvailableMaterials] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const initialSearchQuery = searchParams.get('q') || '';
    setSearchQuery(initialSearchQuery);
    fetchFilteredProducts();
  }, [searchQuery, sortOption, priceRange, selectedMaterials]);

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      try {
        const allProducts = await fetchProducts();
        const materials = new Set<string>();
        allProducts.forEach(product => {
          if (product.material) {
            materials.add(product.material);
          }
        });
        setAvailableMaterials(Array.from(materials));
      } catch (error) {
        console.error('Error fetching materials:', error);
        setError(language === 'fr' ? 'Erreur lors du chargement des matériaux' : 'Error loading materials');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [language]);

  const fetchFilteredProducts = async () => {
    setLoading(true);
    try {
      // Build filter options
      const filterOptions: ProductFilterOptions = {
        search: searchQuery,
        sortBy: sortOption,
        materials: selectedMaterials.length > 0 ? selectedMaterials : undefined,
      };
      
      const fetchedProducts = await fetchProducts(filterOptions);
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(language === 'fr' ? 'Erreur lors du chargement des produits' : 'Error loading products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchQuery = e.target.value;
    setSearchQuery(newSearchQuery);

    if (newSearchQuery) {
      setSearchParams({ q: newSearchQuery });
    } else {
      setSearchParams({});
    }
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
  };

  const toggleMaterial = (material: string) => {
    setSelectedMaterials(prev =>
      prev.includes(material)
        ? prev.filter(m => m !== material)
        : [...prev, material]
    );
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const clearFilters = () => {
    setSelectedMaterials([]);
    setPriceRange([0, 1000]);
    setSortOption('newest');
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <Helmet>
        <title>{language === 'fr' ? 'Produits | Meubles Karim' : 'Products | Meubles Karim'}</title>
        <meta name="description" content={language === 'fr' ? 'Découvrez nos produits' : 'Discover our products'} />
      </Helmet>
      
      <h1 className="font-serif text-3xl font-medium mb-8">
        {language === 'fr' ? 'Nos Produits' : 'Our Products'}
      </h1>
      
      <div className="relative flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar - Desktop */}
        <div className="hidden lg:block w-64 shrink-0 space-y-6">
          <div className="bg-white rounded-lg shadow-soft p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-medium">
                {language === 'fr' ? 'Filtres' : 'Filters'}
              </h3>
              {(selectedMaterials.length > 0 || priceRange[0] > 0 || priceRange[1] < 1000) && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-7">
                  {language === 'fr' ? 'Effacer' : 'Clear'}
                </Button>
              )}
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-3">
                {language === 'fr' ? 'Tri par' : 'Sort by'}
              </h4>
              <Select value={sortOption} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={language === 'fr' ? "Trier par" : "Sort by"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{language === 'fr' ? "Nouveautés" : "Newest"}</SelectItem>
                  <SelectItem value="price-asc">{language === 'fr' ? "Prix croissant" : "Price (Low to High)"}</SelectItem>
                  <SelectItem value="price-desc">{language === 'fr' ? "Prix décroissant" : "Price (High to Low)"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-medium mb-3">
                {language === 'fr' ? 'Gamme de prix' : 'Price Range'}
              </h4>
              <Slider
                defaultValue={priceRange}
                value={priceRange}
                max={1000}
                step={10}
                onValueChange={handlePriceChange}
                className="my-5"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{priceRange[0]}</span>
                <span>{priceRange[1]}</span>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-medium mb-3">
                {language === 'fr' ? 'Matériaux' : 'Materials'}
              </h4>
              <ScrollArea className="h-[200px] pr-3">
                <div className="space-y-2">
                  {availableMaterials.map(material => (
                    <div key={material} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`desktop-material-${material}`}
                        checked={selectedMaterials.includes(material)}
                        onChange={() => toggleMaterial(material)}
                        className="h-4 w-4 rounded border-gray-300 text-furniture-taupe focus:ring-furniture-taupe"
                      />
                      <label
                        htmlFor={`desktop-material-${material}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {material}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          {/* Search and Mobile Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder={language === 'fr' ? 'Rechercher des produits...' : 'Search products...'}
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pr-10"
              />
            </div>
            
            <div className="lg:hidden">
              <Button onClick={toggleFilters} variant="outline" className="w-full md:w-auto">
                <Filter size={16} className="mr-2" />
                {language === 'fr' ? 'Filtres' : 'Filters'}
              </Button>
            </div>
          </div>
          
          {/* Mobile Filters Drawer */}
          {showFilters && (
            <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
              <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-white shadow-xl animate-slide-in-right">
                <div className="p-5 space-y-5 h-full flex flex-col">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-medium">
                      {language === 'fr' ? 'Filtres' : 'Filters'}
                    </h3>
                    <button onClick={toggleFilters} className="p-1 rounded-full hover:bg-muted">
                      <X size={20} />
                    </button>
                  </div>
                  
                  <ScrollArea className="flex-1 pr-3">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium mb-3">
                          {language === 'fr' ? 'Tri par' : 'Sort by'}
                        </h4>
                        <Select value={sortOption} onValueChange={handleSortChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={language === 'fr' ? "Trier par" : "Sort by"} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newest">{language === 'fr' ? "Nouveautés" : "Newest"}</SelectItem>
                            <SelectItem value="price-asc">{language === 'fr' ? "Prix croissant" : "Price (Low to High)"}</SelectItem>
                            <SelectItem value="price-desc">{language === 'fr' ? "Prix décroissant" : "Price (High to Low)"}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="text-sm font-medium mb-3">
                          {language === 'fr' ? 'Gamme de prix' : 'Price Range'}
                        </h4>
                        <Slider
                          defaultValue={priceRange}
                          value={priceRange}
                          max={1000}
                          step={10}
                          onValueChange={handlePriceChange}
                          className="my-5"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{priceRange[0]}</span>
                          <span>{priceRange[1]}</span>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="text-sm font-medium mb-3">
                          {language === 'fr' ? 'Matériaux' : 'Materials'}
                        </h4>
                        <div className="space-y-2">
                          {availableMaterials.map(material => (
                            <div key={material} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`mobile-material-${material}`}
                                checked={selectedMaterials.includes(material)}
                                onChange={() => toggleMaterial(material)}
                                className="h-4 w-4 rounded border-gray-300 text-furniture-taupe focus:ring-furniture-taupe"
                              />
                              <label
                                htmlFor={`mobile-material-${material}`}
                                className="text-sm font-medium cursor-pointer"
                              >
                                {material}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                  
                  <div className="flex gap-3 pt-3 border-t">
                    <Button variant="ghost" onClick={clearFilters} className="w-1/2">
                      {language === 'fr' ? 'Effacer' : 'Clear'}
                    </Button>
                    <Button onClick={toggleFilters} className="w-1/2">
                      {language === 'fr' ? 'Appliquer' : 'Apply'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Active Filters */}
          {(selectedMaterials.length > 0 || priceRange[0] > 0 || priceRange[1] < 1000) && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium">
                  {language === 'fr' ? 'Filtres actifs:' : 'Active filters:'}
                </span>
                
                {selectedMaterials.map(material => (
                  <span 
                    key={material}
                    className="inline-flex items-center bg-furniture-beige text-furniture-brown rounded-full px-3 py-1 text-xs"
                  >
                    {material}
                    <button 
                      onClick={() => toggleMaterial(material)}
                      className="ml-1 text-furniture-brown/70 hover:text-furniture-brown"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
                
                {(priceRange[0] > 0 || priceRange[1] < 1000) && (
                  <span className="inline-flex items-center bg-furniture-beige text-furniture-brown rounded-full px-3 py-1 text-xs">
                    {language === 'fr' ? 'Prix:' : 'Price:'} {priceRange[0]} - {priceRange[1]}
                    <button 
                      onClick={() => setPriceRange([0, 1000])}
                      className="ml-1 text-furniture-brown/70 hover:text-furniture-brown"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Product Listing */}
          {loading && (
            <div className="text-center py-20">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-furniture-taupe border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                  {language === 'fr' ? 'Chargement...' : 'Loading...'}
                </span>
              </div>
              <p className="mt-4 text-muted-foreground">
                {language === 'fr' ? 'Chargement des produits...' : 'Loading products...'}
              </p>
            </div>
          )}
          
          {error && (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
              <Button onClick={fetchFilteredProducts} className="mt-4">
                {language === 'fr' ? 'Réessayer' : 'Try Again'}
              </Button>
            </div>
          )}
          
          {!loading && !error && products.length === 0 && (
            <div className="text-center py-16 bg-muted/30 rounded-lg">
              <div className="max-w-md mx-auto">
                <h3 className="text-xl font-serif mb-2">
                  {language === 'fr' ? 'Aucun produit trouvé' : 'No products found'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {language === 'fr' 
                    ? 'Nous n\'avons trouvé aucun produit correspondant à vos critères de recherche.' 
                    : 'We couldn\'t find any products matching your search criteria.'}
                </p>
                <Button onClick={clearFilters}>
                  {language === 'fr' ? 'Effacer les filtres' : 'Clear Filters'}
                </Button>
              </div>
            </div>
          )}
          
          {!loading && !error && products.length > 0 && (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {language === 'fr' 
                  ? `${products.length} produit${products.length > 1 ? 's' : ''} trouvé${products.length > 1 ? 's' : ''}` 
                  : `${products.length} product${products.length > 1 ? 's' : ''} found`}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
