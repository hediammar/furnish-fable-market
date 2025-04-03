
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/services/productService';
import { fetchCategories } from '@/services/categoryService';
import ProductCard from '@/components/product/ProductCard';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Product } from '@/types/product';
import { Category } from '@/types/category';
import { Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

const Hero = () => (
  <div className="bg-muted py-16 mb-12">
    <div className="container-custom text-center">
      <h1 className="font-serif text-4xl sm:text-5xl mb-4">Our Products</h1>
      <p className="text-muted-foreground max-w-2xl mx-auto">
        Explore our wide selection of handcrafted furniture pieces for every room in your home.
        From elegant sofas to stylish dining tables, we have everything you need to create your perfect space.
      </p>
    </div>
  </div>
);

const ProductsGrid = ({ products, isLoading }: { products: Product[], isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-muted animate-pulse h-72 rounded-md"></div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg text-muted-foreground">No products found matching your criteria.</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.href = '/products'}>
          Clear Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

const materials = ['Wood', 'Leather', 'Fabric', 'Metal', 'Glass', 'Marble'];
const colors = ['Black', 'White', 'Brown', 'Gray', 'Blue', 'Green', 'Red', 'Natural'];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  
  const initialCategory = searchParams.get('category') || 'all';
  const initialMinPrice = Number(searchParams.get('minPrice')) || 0;
  const initialMaxPrice = Number(searchParams.get('maxPrice')) || 5000;
  const initialMaterials = searchParams.get('materials')?.split(',') || [];
  const initialColors = searchParams.get('colors')?.split(',') || [];
  const initialSort = searchParams.get('sort') || 'newest';
  const initialSearch = searchParams.get('search') || '';
  
  const [category, setCategory] = useState(initialCategory);
  const [priceRange, setPriceRange] = useState<[number, number]>([initialMinPrice, initialMaxPrice]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(initialMaterials);
  const [selectedColors, setSelectedColors] = useState<string[]>(initialColors);
  const [sort, setSort] = useState(initialSort);
  const [search, setSearch] = useState(initialSearch);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });
  
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', category, priceRange, selectedMaterials, selectedColors, sort, search],
    queryFn: () => fetchProducts({
      category: category === 'all' ? undefined : category,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      materials: selectedMaterials.length > 0 ? selectedMaterials : undefined,
      colors: selectedColors.length > 0 ? selectedColors : undefined,
      sort,
      search: search || undefined,
    }),
  });
  
  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    if (priceRange[0] > 0) params.set('minPrice', priceRange[0].toString());
    if (priceRange[1] < 5000) params.set('maxPrice', priceRange[1].toString());
    if (selectedMaterials.length > 0) params.set('materials', selectedMaterials.join(','));
    if (selectedColors.length > 0) params.set('colors', selectedColors.join(','));
    if (sort !== 'newest') params.set('sort', sort);
    if (search) params.set('search', search);
    setSearchParams(params);
  }, [category, priceRange, selectedMaterials, selectedColors, sort, search, setSearchParams]);
  
  const clearFilters = () => {
    setCategory('all');
    setPriceRange([0, 5000]);
    setSelectedMaterials([]);
    setSelectedColors([]);
    setSort('newest');
    setSearch('');
    setSearchParams(new URLSearchParams());
  };
  
  const isFilterActive = 
    category !== 'all' ||
    priceRange[0] > 0 ||
    priceRange[1] < 5000 ||
    selectedMaterials.length > 0 ||
    selectedColors.length > 0 ||
    sort !== 'newest' ||
    search !== '';
  
  const FilterSidebar = () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-medium mb-4">Search</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Categories</h3>
          {category !== 'all' && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2" 
              onClick={() => setCategory('all')}
            >
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}
        </div>
        <RadioGroup
          value={category}
          onValueChange={setCategory}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="category-all" />
            <Label htmlFor="category-all">All Categories</Label>
          </div>
          
          {categories && Array.isArray(categories) && categories.map((cat: Category) => (
            <div key={cat.id} className="flex items-center space-x-2">
              <RadioGroupItem value={cat.name} id={`category-${cat.id}`} />
              <Label htmlFor={`category-${cat.id}`}>{cat.name}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Price Range</h3>
          {(priceRange[0] > 0 || priceRange[1] < 5000) && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2" 
              onClick={() => setPriceRange([0, 5000])}
            >
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}
        </div>
        <div className="pt-4 pb-8">
          <Slider
            defaultValue={priceRange}
            min={0}
            max={5000}
            step={50}
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">${priceRange[0]}</span>
          <span className="text-sm">${priceRange[1]}</span>
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Materials</h3>
          {selectedMaterials.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2" 
              onClick={() => setSelectedMaterials([])}
            >
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}
        </div>
        <div className="space-y-2">
          {materials.map((material) => (
            <div key={material} className="flex items-center space-x-2">
              <Checkbox 
                id={`material-${material}`} 
                checked={selectedMaterials.includes(material)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedMaterials([...selectedMaterials, material]);
                  } else {
                    setSelectedMaterials(selectedMaterials.filter(m => m !== material));
                  }
                }}
              />
              <Label htmlFor={`material-${material}`}>{material}</Label>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Colors</h3>
          {selectedColors.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2" 
              onClick={() => setSelectedColors([])}
            >
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {colors.map((color) => (
            <div key={color} className="flex items-center space-x-2">
              <Checkbox 
                id={`color-${color}`} 
                checked={selectedColors.includes(color)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedColors([...selectedColors, color]);
                  } else {
                    setSelectedColors(selectedColors.filter(c => c !== color));
                  }
                }}
              />
              <Label htmlFor={`color-${color}`}>{color}</Label>
            </div>
          ))}
        </div>
      </div>
      
      {isFilterActive && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          Clear All Filters
        </Button>
      )}
    </div>
  );
  
  return (
    <main>
      <Helmet>
        <title>Products | Meubles Karim</title>
        <meta name="description" content="Browse our wide selection of quality furniture for your home. Find sofas, chairs, tables, and more with free delivery." />
        <meta name="keywords" content="furniture, sofa, chair, table, home decor, wood furniture, modern furniture" />
      </Helmet>
      
      <Hero />
      
      <div className="container-custom pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-2xl">
            {isLoading ? 'Loading products...' : `${products.length} Products`}
          </h2>
          
          <div className="flex items-center gap-4">
            {isMobile && (
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Filter size={16} /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="overflow-y-auto">
                  <h2 className="font-serif text-xl mb-6">Filters</h2>
                  <FilterSidebar />
                </SheetContent>
              </Sheet>
            )}
            
            <div className="flex items-center gap-2">
              <Label htmlFor="sort-by" className="whitespace-nowrap hidden sm:inline">Sort by:</Label>
              <select
                id="sort-by"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {!isMobile && (
            <div className="hidden lg:block">
              <FilterSidebar />
            </div>
          )}
          
          <div className="lg:col-span-3">
            <ProductsGrid products={products} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Products;
