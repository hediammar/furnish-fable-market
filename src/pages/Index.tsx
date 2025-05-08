import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Hero from '@/components/home/Hero';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import CategorySection from '@/components/home/CategorySection';
import ReviewsCarousel from '@/components/home/ReviewsCarousel';
import NewsletterSection from '@/components/home/NewsletterSection';
import PartnersCarousel from '@/components/home/PartnersCarousel';
import GoogleReviews from '@/components/home/GoogleReviews';
import { fetchProducts, fetchFeaturedProducts } from '@/services/productService';
import { fetchCategories } from '@/services/categoryService';
import { fetchPartners } from '@/services/partnerService';
import { useLanguage } from '@/context/LanguageContext';
import ModernMinimalistSection from '@/components/home/ModernMinimalistSection';
import StatsSection from '@/components/home/StatsSection';
import ModernStyleSection from '@/components/home/ModernStyleSection';
import CategoryShowcaseSection from '@/components/home/CategoryShowcaseSection';
import RendezVousModal from '@/components/ui/RendezVousModal';
import { useAuth } from '@/context/AuthContext';
import { Separator } from '@radix-ui/react-separator';

const Index: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [isRendezVousOpen, setIsRendezVousOpen] = useState(false);

  // Fetch featured products
  const { data: products = [] } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: fetchFeaturedProducts,
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

  const heroVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.8,
      y: 100,
      filter: "blur(10px)"
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 1.2,
        ease: [0.6, -0.05, 0.01, 0.99],
        delay: 0.2
      }
    }
  };

  const sectionVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.9,
      y: 50,
      rotateX: 15,
      filter: "blur(5px)"
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      rotateX: 0,
      filter: "blur(0px)",
      transition: {
        duration: 1,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  };

  const reviewsVariants = {
    hidden: { 
      opacity: 0,
      x: -100,
      rotateY: 30,
      filter: "blur(5px)"
    },
    visible: {
      opacity: 1,
      x: 0,
      rotateY: 0,
      filter: "blur(0px)",
      transition: {
        duration: 1,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  };

  const newsletterVariants = {
    hidden: { 
      opacity: 0,
      y: 100,
      scale: 0.9,
      filter: "blur(5px)"
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 1,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="overflow-hidden">
        <Helmet>
          <title>{language === 'fr' ? 'Accueil | Meubles Karim' : 'Home | Meubles Karim'}</title>
          <meta name="description" content={language === 'fr' ? 'Meubles Karim - Meubles de luxe' : 'Meubles Karim - Luxury Furniture'} />
        </Helmet>

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={heroVariants}
          className="relative z-10"
        >
          <Hero />
        </motion.div>
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "0px" }}
          variants={sectionVariants}
          className="relative z-20"
        >
          <CategoryShowcaseSection 
            title={language === 'fr' ? 'Explorez Notre Collection' : 'Explore Our Proudly Collection'}
            subtitle={language === 'fr' ? 'Découvrez nos catégories de meubles les plus appréciées.' : 'Discover our most beloved furniture categories.'}
            categories={categories.slice(0, 6)}
          />
        </motion.div>
        
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "0px" }}
          variants={sectionVariants}
          className="relative z-20"
        >
          <StatsSection />
        </motion.div>
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "0px" }}
          variants={sectionVariants}
          className="relative z-20"
        >
          <ModernStyleSection onRendezVousClick={() => setIsRendezVousOpen(true)} />
        </motion.div>
        
       
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "0px" }}
          variants={sectionVariants}
          className="relative z-20"
        >
          <FeaturedProducts 
            title={language === 'fr' ? "Collection en Tendance" : "Trending Collection"} 
            subtitle={language === 'fr' 
              ? "Découvrez nos pièces les plus populaires, soigneusement sélectionnées pour votre maison" 
              : "Discover our most popular pieces, carefully selected for your home"
            }
            products={products} 
          />
        </motion.div>
        
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "0px" }}
          variants={sectionVariants}
          className="relative z-20"
        >
          <PartnersCarousel partners={partners} />
        </motion.div>
        
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "0px" }}
          variants={reviewsVariants}
          className="relative z-30"
        >
          <ReviewsCarousel />
        </motion.div>
        
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "0px" }}
          variants={newsletterVariants}
          className="relative z-20"
        >
          <NewsletterSection />
        </motion.div>

        <RendezVousModal
          open={isRendezVousOpen}
          onOpenChange={setIsRendezVousOpen}
          user={user}
          language={language}
        />
      </div>
    </AnimatePresence>
  );
};

export default Index;
