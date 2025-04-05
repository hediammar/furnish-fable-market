
import React, { useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Partner } from '@/types/partner';

interface PartnersCarouselProps {
  partners: Partner[];
}

const PartnersCarousel: React.FC<PartnersCarouselProps> = ({ partners }) => {
  const { language } = useLanguage();
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!carouselRef.current || partners.length === 0) return;
    
    const carousel = carouselRef.current;
    const totalItems = partners.length;
    const angleStep = (2 * Math.PI) / totalItems;
    const radius = Math.min(carousel.offsetWidth, 600) / 3;
    const centerX = carousel.offsetWidth / 2;
    const centerY = carousel.offsetHeight / 2;
    
    const children = Array.from(carousel.children) as HTMLElement[];
    
    let angle = 0;
    let animationFrameId: number;
    
    const rotateCarousel = () => {
      angle += 0.001;
      
      children.forEach((item, index) => {
        const itemAngle = angle + (index * angleStep);
        const x = centerX + radius * Math.cos(itemAngle) - item.offsetWidth / 2;
        const y = centerY + radius * Math.sin(itemAngle) - item.offsetHeight / 2;
        
        const scale = 0.8 + (0.2 * Math.sin(itemAngle + Math.PI));
        const zIndex = Math.round(50 + 50 * Math.sin(itemAngle + Math.PI));
        
        item.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
        item.style.zIndex = String(zIndex);
        item.style.opacity = String(0.5 + 0.5 * Math.sin(itemAngle + Math.PI));
      });
      
      animationFrameId = requestAnimationFrame(rotateCarousel);
    };
    
    rotateCarousel();
    
    const handleResize = () => {
      if (!carousel) return;
      const newRadius = Math.min(carousel.offsetWidth, 600) / 3;
      const newCenterX = carousel.offsetWidth / 2;
      const newCenterY = carousel.offsetHeight / 2;
      
      children.forEach((item, index) => {
        const itemAngle = angle + (index * angleStep);
        const x = newCenterX + newRadius * Math.cos(itemAngle) - item.offsetWidth / 2;
        const y = newCenterY + newRadius * Math.sin(itemAngle) - item.offsetHeight / 2;
        
        item.style.transform = `translate(${x}px, ${y}px)`;
      });
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [partners]);

  if (partners.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-furniture-cream overflow-hidden">
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
        
        <div className="h-[400px] relative" ref={carouselRef}>
          {partners.map((partner) => (
            <a
              key={partner.id}
              href={partner.website || '#'}
              target={partner.website ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className="absolute transition-all duration-500 ease-in-out bg-white rounded-full shadow-md p-2 w-24 h-24 flex items-center justify-center hover:shadow-lg cursor-pointer"
              title={partner.name}
            >
              <img 
                src={partner.logo} 
                alt={partner.name} 
                className="max-h-full max-w-full object-contain rounded-full p-2" 
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersCarousel;
