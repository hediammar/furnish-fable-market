
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import Hero from '@/components/home/Hero';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import CategorySection from '@/components/home/CategorySection';
import ReviewsCarousel from '@/components/home/ReviewsCarousel';
import NewsletterSection from '@/components/home/NewsletterSection';
import PartnersCarousel from '@/components/home/PartnersCarousel';
import { fetchProducts } from '@/services/productService';
import { fetchCategories } from '@/services/categoryService';
import { fetchPartners } from '@/services/partnerService';
import { useLanguage } from '@/context/LanguageContext';

const Index: React.FC = () => {
  const { language } = useLanguage();

  // Fetch featured products
  const { data: products = [] } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: async () => {
      const allProducts = await fetchProducts();
      // Return only the featured products
      return allProducts.filter(product => product.featured);
    },
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['homeCategories'],
    queryFn: fetchCategories,
  });

  // Fetch partners
  const { data: partners = [] } = useQuery({
    queryKey: ['partners'],
    queryFn: fetchPartners,
  });

  return (
    <div>
      <Helmet>
        <title>{language === 'fr' ? 'Accueil | Meubles Karim' : 'Home | Meubles Karim'}</title>
        <meta name="description" content={language === 'fr' ? 'Meubles Karim - Meubles de luxe' : 'Meubles Karim - Luxury Furniture'} />
      </Helmet>

      <Hero />
      
      <FeaturedProducts 
        title={language === 'fr' ? "Collection en Vedette" : "Featured Collection"} 
        subtitle={language === 'fr' 
          ? "Découvrez nos pièces les plus populaires, soigneusement sélectionnées pour votre maison" 
          : "Discover our most popular pieces, carefully selected for your home"
        }
        products={products} 
      />
      
      <CategorySection 
        title={language === 'fr' ? "Nos Catégories" : "Our Categories"} 
        subtitle={language === 'fr' 
          ? "Explorez notre gamme diversifiée de catégories de meubles" 
          : "Explore our diverse range of furniture categories"
        }
        categories={categories.slice(0, 3)} 
      />
      
      <PartnersCarousel partners={partners} />
      
      <ReviewsCarousel />
      
      <NewsletterSection />
    </div>
  );
};

export default Index;
