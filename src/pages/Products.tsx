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
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
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
        // No 'sort' property, use 'sortBy' instead which is defined in the interface
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

  return (
    <div className="container mx-auto py-12 px-4">
      <Helmet>
        <title>{language === 'fr' ? 'Produits | Meubles Karim' : 'Products | Meubles Karim'}</title>
        <meta name="description" content={language === 'fr' ? 'Découvrez nos produits' : 'Discover our products'} />
      </Helmet>
      
      <h1 className="font-serif text-3xl font-medium mb-8">
        {language === 'fr' ? 'Nos Produits' : 'Our Products'}
      </h1>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Search */}
        <div className="md:col-span-2">
          <Input
            type="text"
            placeholder={language === 'fr' ? 'Rechercher des produits...' : 'Search products...'}
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        {/* Sort By */}
        <div>
          <Select onValueChange={handleSortChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={language === 'fr' ? "Trier par" : "Sort by"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{language === 'fr' ? "Nouveautés" : "Newest"}</SelectItem>
              <SelectItem value="price-asc">{language === 'fr' ? "Prix croissant" : "Price (Low to High)"}</SelectItem>
              <SelectItem value="price-desc">{language === 'fr' ? "Prix décroissant" : "Price (High to Low)"}</SelectItem>
              {/* <SelectItem value="rating">{language === 'fr' ? "Meilleures notes" : "Best Rating"}</SelectItem> */}
            </SelectContent>
          </Select>
        </div>

        {/* Filters */}
        <div className="hidden md:block">
          <Accordion type="single" collapsible>
            <AccordionItem value="filter">
              <AccordionTrigger>
                {language === 'fr' ? "Filtres" : "Filters"}
              </AccordionTrigger>
              <AccordionContent>
                {/* Price Range */}
                <div className="mb-4">
                  <h4 className="font-medium">{language === 'fr' ? "Gamme de prix" : "Price Range"}</h4>
                  <Slider
                    defaultValue={priceRange}
                    max={1000}
                    step={10}
                    onValueChange={handlePriceChange}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{priceRange[0]}</span>
                    <span>{priceRange[1]}</span>
                  </div>
                </div>

                {/* Materials */}
                <div>
                  <h4 className="font-medium">{language === 'fr' ? "Matériaux" : "Materials"}</h4>
                  <ScrollArea className="h-[200px] w-full rounded-md border">
                    <div className="p-3">
                      {availableMaterials.map(material => (
                        <div key={material} className="flex items-center space-x-2">
                          <Input
                            type="checkbox"
                            id={`material-${material}`}
                            checked={selectedMaterials.includes(material)}
                            onChange={() => toggleMaterial(material)}
                          />
                          <label
                            htmlFor={`material-${material}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {material}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Product Listing */}
      {loading && <p>{language === 'fr' ? 'Chargement des produits...' : 'Loading products...'}</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Products;
