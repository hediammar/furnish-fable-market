
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Partner } from '@/types/partner';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { motion } from 'framer-motion';

interface PartnersCarouselProps {
  partners: Partner[];
}

const PartnersCarousel: React.FC<PartnersCarouselProps> = ({ partners }) => {
  const { language } = useLanguage();
  
  if (partners.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-medium mb-4">
            {language === 'fr' ? 'Nos Partenaires' : 'Our Partners'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {language === 'fr' 
              ? 'Découvrez les marques prestigieuses avec lesquelles nous collaborons pour créer votre intérieur idéal.'
              : 'Discover the prestigious brands we collaborate with to create your ideal interior.'}
          </p>
        </div>
        
        <Carousel className="w-full max-w-5xl mx-auto">
          <CarouselContent className="-ml-4">
            {partners.map((partner) => (
              <CarouselItem key={partner.id} className="pl-4 md:basis-1/3 lg:basis-1/4">
                <motion.div 
                  whileHover={{ y: -5, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="h-full"
                >
                  <a
                    href={partner.website || '#'}
                    target={partner.website ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    className="block h-full"
                  >
                    <div className="bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden h-full transition-all duration-300">
                      <div className="p-6 flex flex-col items-center text-center h-full">
                        <div className="w-24 h-24 rounded-full bg-gray-50 p-3 mb-4 flex items-center justify-center">
                          <img 
                            src={partner.logo} 
                            alt={partner.name} 
                            className="max-h-full max-w-full object-contain" 
                          />
                        </div>
                        <h3 className="font-medium text-lg mb-2">{partner.name}</h3>
                        {partner.description && (
                          <p className="text-sm text-muted-foreground line-clamp-3">{partner.description}</p>
                        )}
                      </div>
                    </div>
                  </a>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0 lg:-left-12" />
          <CarouselNext className="right-0 lg:-right-12" />
        </Carousel>
      </div>
    </section>
  );
};

export default PartnersCarousel;
