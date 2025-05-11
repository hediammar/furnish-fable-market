import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Product } from '@/types/product';
import { ProductFilterOptions, fetchProducts } from '@/services/productService';
import { fetchCategories, fetchSubcategories, fetchAllSubcategories } from '@/services/categoryService';
import { fetchMaterials, fetchTextiles } from '@/services/materialService';
import { Category, Subcategory } from '@/types/category';
import { Material } from '@/types/material';
import { Textile } from '@/types/textile';
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
  const [selectedTextiles, setSelectedTextiles] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]);
  const [availableTextiles, setAvailableTextiles] = useState<Textile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [allSubcategories, setAllSubcategories] = useState<Subcategory[]>([]);

  useEffect(() => {
    const initialSearchQuery = searchParams.get('q') || '';
    setSearchQuery(initialSearchQuery);
    fetchFilteredProducts();
    loadCategories();
  }, []);

  useEffect(() => {
    fetchFilteredProducts();
  }, [searchQuery, sortOption, priceRange, selectedMaterials, selectedCategories, selectedSubcategory]);

  useEffect(() => {
    const fetchMaterialsAndTextiles = async () => {
      setLoading(true);
      try {
        const [materials, textiles] = await Promise.all([
          fetchMaterials(),
          fetchTextiles()
        ]);
        setAvailableMaterials(materials);
        setAvailableTextiles(textiles);
      } catch (error) {
        console.error('Error fetching materials and textiles:', error);
        setError(language === 'fr' ? 'Erreur lors du chargement des matériaux et textiles' : 'Error loading materials and textiles');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterialsAndTextiles();
  }, [language]);

  useEffect(() => {
    const loadSubcategories = async () => {
      if (selectedCategories.length === 1) {
        try {
          const category = categories.find(cat => cat.name === selectedCategories[0]);
          if (category) {
            const subcategoriesData = await fetchSubcategories(category.id);
            setSubcategories(subcategoriesData);
          }
        } catch (error) {
          console.error('Error loading subcategories:', error);
        }
      } else {
        setSubcategories([]);
        setSelectedSubcategory('all');
      }
    };

    loadSubcategories();
  }, [selectedCategories, categories]);

  useEffect(() => {
    const loadAllSubcategories = async () => {
      if (selectedCategories.length === 0) {
        try {
          const allSubs = await fetchAllSubcategories();
          setAllSubcategories(allSubs);
        } catch (error) {
          console.error('Error loading all subcategories:', error);
        }
      } else {
        setAllSubcategories([]);
      }
    };
    loadAllSubcategories();
  }, [selectedCategories]);

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
        material_ids: selectedMaterials.length > 0 ? selectedMaterials : undefined,
        textile_ids: selectedTextiles.length > 0 ? selectedTextiles : undefined,
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
        subcategory: selectedSubcategory !== 'all' ? selectedSubcategory : undefined,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 1000 ? priceRange[1] : undefined,
      };
      
      console.log('Filtering products with options:', filterOptions);
      const data = await fetchProducts(filterOptions);
      console.log(`Found ${data.length} products`);
      setProducts(data);
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
        : [categoryId] // Only allow one category to be selected at a time
    );
  };

  const handleSubcategoryChange = (value: string) => {
    setSelectedSubcategory(value);
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
    setSelectedTextiles([]);
    setSelectedCategories([]);
    setSelectedSubcategory('all');
    setSortOption('newest');
  };

  // Group products by subcategory
  const groupedProducts = products.reduce((acc, product) => {
    const subcategory = product.subcategory || 'Uncategorized';
    if (!acc[subcategory]) {
      acc[subcategory] = [];
    }
    acc[subcategory].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  // Create a mapping from subcategory ID to subcategory name
  let subcategoryIdToName: Record<string, string> = {};
  if (selectedCategories.length === 1 && subcategories.length > 0) {
    subcategoryIdToName = subcategories.reduce((acc, subcat) => {
      acc[subcat.id] = subcat.name;
      return acc;
    }, {} as Record<string, string>);
  } else if (selectedCategories.length === 0 && allSubcategories.length > 0) {
    subcategoryIdToName = allSubcategories.reduce((acc, subcat) => {
      acc[subcat.id] = subcat.name;
      return acc;
    }, {} as Record<string, string>);
  } else {
    subcategoryIdToName = products.reduce((acc, product) => {
      if (product.subcategory && product.subcategory !== 'Uncategorized') {
        acc[product.subcategory] = product.subcategory;
      }
      return acc;
    }, {} as Record<string, string>);
  }

  return (
    <div className="min-h-screen bg-white" >
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
      
      {/* Dynamic Category Text Block */}
      <div className="text-center mt-10">
        <h2 className="text-4xl font-serif font-semibold">
          {selectedCategories.length === 1
            ? selectedCategories[0]
            : selectedCategories.length > 1
              ? selectedCategories.join(', ')
              : language === 'fr' ? 'Voir tout' : 'View All'}
        </h2>
      </div>

      {/* Filters and Search Row */}
      <div className="flex flex-col items-center gap-4 mt-8">
        <div className="flex flex-row gap-4 w-full max-w-4xl justify-center">
          {/* Categories Dropdown */}
          <Select value={selectedCategories[0] || "all"} onValueChange={value => setSelectedCategories(value === "all" ? [] : [value])}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={language === 'fr' ? 'Catégories' : 'Categories'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'fr' ? 'Voir tout' : 'View All'}</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Subcategories Dropdown */}
          {selectedCategories.length === 1 && subcategories.length > 0 && (
            <Select value={selectedSubcategory} onValueChange={handleSubcategoryChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={language === 'fr' ? 'Sous-catégories' : 'Subcategories'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'fr' ? 'Toutes les sous-catégories' : 'All Subcategories'}</SelectItem>
                {subcategories.map(subcategory => (
                  <SelectItem key={subcategory.id} value={subcategory.id}>{subcategory.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Materials Dropdown */}
          <Select 
            value={selectedMaterials[0] || "all"} 
            onValueChange={value => setSelectedMaterials(value === "all" ? [] : [value])}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={language === 'fr' ? 'Matériaux' : 'Materials'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'fr' ? 'Voir tout' : 'View All'}</SelectItem>
              {availableMaterials.map(material => (
                <SelectItem key={material.id} value={material.id}>
                  {material.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Textiles Dropdown */}
          <Select 
            value={selectedTextiles[0] || "all"} 
            onValueChange={value => setSelectedTextiles(value === "all" ? [] : [value])}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={language === 'fr' ? 'Textiles' : 'Textiles'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'fr' ? 'Voir tout' : 'View All'}</SelectItem>
              {availableTextiles.map(textile => (
                <SelectItem key={textile.id} value={textile.id}>
                  {textile.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search Bar */}
          <Input
            type="text"
            placeholder={language === 'fr' ? 'Rechercher...' : 'Search by product name'}
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-[250px]"
          />
        </div>
      </div>
      
      {/* Product Grid */}
      <div className="container mx-auto px-4 pb-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 animate-pulse">
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
          <div className="space-y-12">
            
            {Object.entries(groupedProducts).map(([subcategoryId, products]) => {
              let headerLabel = subcategoryIdToName[subcategoryId];
              if (!headerLabel) {
                if (!subcategoryId || subcategoryId === 'Uncategorized') {
                  headerLabel = language === 'fr' ? 'Sans sous-catégorie' : 'Uncategorized';
                } else {
                  headerLabel = subcategoryId;
                }
              }
              return (
                <div key={subcategoryId} className="space-y-6">
                  <Separator className="my-10" />
                  <h2
                    className="text-2xl font-medium text-center"
                    style={{ fontFamily: 'Didot, Bodoni Moda, Playfair Display, serif' }}
                  >
                    {headerLabel}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="flex flex-col items-center group cursor-pointer transition-transform hover:scale-105"
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        <div className="relative w-full flex justify-center">
                          <img
                            src={product.image_nobg}
                            alt={product.name}
                            className="h-64 object-contain rounded-lg shadow-md"
                          />
                          {product.new && (
                            <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">New</span>
                          )}
                          {product.featured && (
                            <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">In Trend</span>
                          )}
                        </div>
                        <div className="mt-4 text-center font-medium text-lg" style={{ fontFamily: 'Didot, Bodoni Moda, Playfair Display, serif' }}>{product.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
