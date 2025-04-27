import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Partner } from '@/types/partner';
import { useLanguage } from '@/context/LanguageContext';

interface PartnersCarouselProps {
  partners: Partner[];
}

const PartnersCarousel: React.FC<PartnersCarouselProps> = ({ partners }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const handlePartnerClick = (partnerId: string) => {
    // Animate the logo before navigation
    const logo = document.getElementById(`partner-logo-${partnerId}`);
    if (logo) {
      logo.style.transition = 'all 0.3s ease';
      logo.style.transform = 'scale(1.1)';
    }

    // Add a small delay before navigation to allow the animation to complete
    setTimeout(() => {
      navigate(`/partners/${partnerId}`);
    }, 300);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-medium mb-4">
            {language === 'fr' ? 'Nos Partenaires Prestigieux' : 'Our Prestigious Partners'}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {language === 'fr' 
              ? 'Découvrez les projets de luxe que nous avons réalisés pour nos partenaires'
              : 'Discover the luxury projects we have completed for our partners'}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {partners.map((partner) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <motion.div
                className="aspect-square bg-white rounded-lg p-8 flex items-center justify-center cursor-pointer overflow-hidden"
                onClick={() => handlePartnerClick(partner.id)}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <motion.img
                  id={`partner-logo-${partner.id}`}
                  src={partner.logo}
                  alt={partner.name}
                  className="w-full h-full object-contain transition-all duration-300 filter grayscale group-hover:grayscale-0"
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div
                  className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                />
              </motion.div>
              <motion.p
                className="text-center mt-4 text-lg font-medium"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                {partner.name}
              </motion.p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersCarousel;
