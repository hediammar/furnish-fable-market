
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getHeroContent } from '@/services/heroService';
import { useLanguage } from '@/context/LanguageContext';

const AboutHero: React.FC = () => {
  const { language } = useLanguage();
  const { data: heroContent, isLoading } = useQuery({
    queryKey: ['heroContent', 'about', language],
    queryFn: () => getHeroContent('about'),
  });

  // Default content as fallback
  const defaultContent = {
    title: language === 'fr' 
      ? 'Notre Histoire' 
      : 'Our Story',
    subtitle: language === 'fr'
      ? 'Découvrez la passion et le savoir-faire derrière chaque meuble que nous créons.'
      : 'Discover the passion and craftsmanship behind every piece of furniture we create.',
    primary_button_text: '',
    primary_button_link: '',
    secondary_button_text: '',
    secondary_button_link: '',
    background_image: 'https://images.unsplash.com/photo-1616486029426-5aff36ecb6c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80'
  };

  // Combine DB content with defaults for any missing fields
  const content = heroContent ? {
    ...defaultContent,
    ...heroContent,
    // Handle empty strings
    title: heroContent.title || defaultContent.title,
    subtitle: heroContent.subtitle || defaultContent.subtitle,
    primary_button_text: heroContent.primary_button_text || defaultContent.primary_button_text,
    primary_button_link: heroContent.primary_button_link || defaultContent.primary_button_link,
    secondary_button_text: heroContent.secondary_button_text || defaultContent.secondary_button_text,
    secondary_button_link: heroContent.secondary_button_link || defaultContent.secondary_button_link,
    background_image: heroContent.background_image || defaultContent.background_image
  } : defaultContent;

  return (
    <section className="relative h-[60vh] overflow-hidden">
      {/* Hero Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={content.background_image}
          alt="Craftsmen working on furniture" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30"></div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 h-full flex flex-col justify-center text-white">
        <div className="max-w-2xl animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-6">
            {content.title}
          </h1>
          <p className="text-lg md:text-xl mb-8 text-white/90 max-w-xl">
            {content.subtitle}
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
