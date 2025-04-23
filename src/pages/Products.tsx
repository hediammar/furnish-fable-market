import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Product } from '@/types/product';
import { ProductFilterOptions, fetchProducts } from '@/services/productService';
import { fetchCategories } from '@/services/categoryService';
import { Category } from '@/types/category';
import ProductCard from '@/components/product/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Filter, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [availableMaterials, setAvailableMaterials] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const initialSearchQuery = searchParams.get('q') || '';
    setSearchQuery(initialSearchQuery);
    fetchFilteredProducts();
    loadCategories();
  }, []);

  useEffect(() => {
    fetchFilteredProducts();
  }, [searchQuery, sortOption, priceRange, selectedMaterials, selectedCategories]);

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

  const loadCategories = async () => {
    try {
      const categoriesData = await fetchCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const fetchFilteredProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const filterOptions: ProductFilterOptions = {
        search: searchQuery || undefined,
        sort: sortOption,
        materials: selectedMaterials.length > 0 ? selectedMaterials : undefined,
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 1000 ? priceRange[1] : undefined,
      };
      
      console.log('Filtering products with options:', filterOptions);
      const data = await fetchProducts(filterOptions);
      console.log(`Found ${data.length} products`);
      setProducts(data);
      
      // Extract unique materials from products for filter options
      if (data.length > 0 && availableMaterials.length === 0) {
        const materials = data
          .map(product => product.material)
          .filter((material): material is string => !!material)
          .filter((value, index, self) => self.indexOf(value) === index);
        
        setAvailableMaterials(materials);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching products');
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialToggle = (material: string) => {
    setSelectedMaterials(prev => 
      prev.includes(material)
        ? prev.filter(m => m !== material)
        : [...prev, material]
    );
  };
  
  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
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

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const clearFilters = () => {
    setPriceRange([0, 1000]);
    setSelectedMaterials([]);
    setSelectedCategories([]);
    setSortOption('newest');
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>
          {language === 'fr' ? 'Produits | Meubles Karim' : 'Products | Meubles Karim'}
        </title>
      </Helmet>
      
      {/* Hero Section */}
      <section className="relative h-[40vh] overflow-hidden">
        {/* Hero Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
            alt="Elegant furniture collection" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30"></div>
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10 h-full flex flex-col justify-center text-white">
          <div className="max-w-2xl animate-fade-in">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold leading-tight mb-4">
              {language === 'fr' ? 'Notre Collection' : 'Our Collection'}
            </h1>
            <p className="text-lg mb-6 text-white/90 max-w-xl">
              {language === 'fr' 
                ? 'Découvrez notre gamme complète de meubles de qualité pour chaque pièce de votre maison.' 
                : 'Explore our full range of quality furniture for every room in your home.'}
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => window.scrollTo({ top: window.innerHeight * 0.4, behavior: 'smooth' })}
                className="bg-white text-gray-900 hover:bg-gray-200 font-medium px-6 py-2 rounded-md transition-colors duration-300 flex items-center"
              >
                {language === 'fr' ? 'Explorer' : 'Browse Collection'} <ArrowRight size={16} className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      </section>
      
      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="w-full md:w-auto flex-1 max-w-md">
            <Input
              type="text"
              placeholder={language === 'fr' ? 'Rechercher des produits...' : 'Search products...'}
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={sortOption} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={language === 'fr' ? 'Trier par' : 'Sort by'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">
                  {language === 'fr' ? 'Plus récent' : 'Newest'}
                </SelectItem>
                <SelectItem value="price_low">
                  {language === 'fr' ? 'Prix: croissant' : 'Price: Low to High'}
                </SelectItem>
                <SelectItem value="price_high">
                  {language === 'fr' ? 'Prix: décroissant' : 'Price: High to Low'}
                </SelectItem>
                <SelectItem value="name_asc">
                  {language === 'fr' ? 'Nom: A-Z' : 'Name: A-Z'}
                </SelectItem>
                <SelectItem value="name_desc">
                  {language === 'fr' ? 'Nom: Z-A' : 'Name: Z-A'}
                </SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              className={cn(
                "md:hidden",
                (selectedMaterials.length > 0 || selectedCategories.length > 0) && "border-primary text-primary"
              )}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} className="mr-2" />
              {language === 'fr' ? 'Filtres' : 'Filters'}
              {(selectedMaterials.length > 0 || selectedCategories.length > 0) && 
                <span className="ml-1 text-xs bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center">
                  {selectedMaterials.length + selectedCategories.length}
                </span>
              }
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={cn(
            "w-full md:w-64 shrink-0 transition-all",
            showFilters ? "block" : "hidden md:block"
          )}>
            <div className="bg-card rounded-lg border p-4 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-lg">
                  {language === 'fr' ? 'Filtres' : 'Filters'}
                </h3>
                
                {(selectedMaterials.length > 0 || selectedCategories.length > 0) && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
                    <X size={14} className="mr-1" />
                    {language === 'fr' ? 'Effacer' : 'Clear'}
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setShowFilters(false)}
                >
                  <X size={18} />
                </Button>
              </div>
              
              <Accordion type="multiple" defaultValue={["categories", "materials"]}>
                {/* Categories Filter */}
                <AccordionItem value="categories">
                  <AccordionTrigger className="text-sm font-medium py-2">
                    {language === 'fr' ? 'Catégories' : 'Categories'}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ScrollArea className="h-[200px] pr-3">
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <div key={category.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`category-${category.name}`} 
                              checked={selectedCategories.includes(category.name)}
                              onCheckedChange={() => handleCategoryToggle(category.name)}
                            />
                            <label 
                              htmlFor={`category-${category.id}`}
                              className="text-sm cursor-pointer"
                            >
                              {category.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </AccordionContent>
                </AccordionItem>
                
                <Separator className="my-2" />
                
                {/* Materials Filter */}
                <AccordionItem value="materials">
                  <AccordionTrigger className="text-sm font-medium py-2">
                    {language === 'fr' ? 'Matériaux' : 'Materials'}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ScrollArea className="h-[200px] pr-3">
                      <div className="space-y-2">
                        {availableMaterials.map((material) => (
                          <div key={material} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`material-${material}`} 
                              checked={selectedMaterials.includes(material)}
                              onCheckedChange={() => handleMaterialToggle(material)}
                            />
                            <label 
                              htmlFor={`material-${material}`}
                              className="text-sm cursor-pointer"
                            >
                              {material}
                            </label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </aside>
          
          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-muted rounded-lg h-[350px]"></div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive">{error}</p>
                <Button 
                  variant="outline" 
                  onClick={fetchFilteredProducts}
                  className="mt-4"
                >
                  {language === 'fr' ? 'Réessayer' : 'Try Again'}
                </Button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">
                  {language === 'fr' ? 'Aucun produit trouvé' : 'No products found'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {language === 'fr' 
                    ? 'Essayez d\'ajuster vos filtres ou votre recherche.' 
                    : 'Try adjusting your filters or search term.'}
                </p>
                {(searchQuery || selectedMaterials.length > 0 || selectedCategories.length > 0) && (
                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                  >
                    {language === 'fr' ? 'Effacer les filtres' : 'Clear Filters'}
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onClick={() => navigate(`/product/${product.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
