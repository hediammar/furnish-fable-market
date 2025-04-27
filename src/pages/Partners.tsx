import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { Partner } from '@/types/partner';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Sample partner data - replace with your actual data
const partners: Partner[] = [
  {
    id: '1',
    name: 'Luxury Hotel Paris',
    logo: '/images/partners/hotel-paris-logo.png',
    website: 'https://luxuryhotelparis.com',
    description: 'A prestigious 5-star hotel in the heart of Paris',
    projects: [
      {
        title: 'Luxury Suite Renovation',
        description: 'Complete renovation of 20 luxury suites with custom furniture and premium finishes',
        images: [
          '/images/projects/hotel-paris-1.jpg',
          '/images/projects/hotel-paris-2.jpg',
          '/images/projects/hotel-paris-3.jpg'
        ]
      }
    ]
  },
  // Add more partners here
];

const Partners: React.FC = () => {
  const { language } = useLanguage();
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('partners.title')} | Meubles Karim</title>
        <meta name="description" content={t('partners.metaDescription')} />
      </Helmet>

      <div className="min-h-screen bg-off-white">
        {/* Hero Section */}
        <section className="relative h-[60vh] flex items-center justify-center bg-black text-white overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="container mx-auto px-4 text-center"
          >
            <h1 className="text-4xl md:text-6xl font-serif mb-6">
              {t('partners.heroTitle')}
            </h1>
            <p className="text-xl md:text-2xl text-gold max-w-3xl mx-auto">
              {t('partners.heroSubtitle')}
            </p>
          </motion.div>
        </section>

        {/* Partners Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {partners.map((partner, index) => (
                <motion.div
                  key={partner.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    {/* Partner Logo */}
                    <div className="p-8 bg-off-white">
                      <div className="h-32 flex items-center justify-center">
                        <img
                          src={partner.logo}
                          alt={partner.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    </div>

                    {/* Partner Info */}
                    <div className="p-6">
                      <h3 className="text-2xl font-serif mb-4">{partner.name}</h3>
                      <p className="text-gray-600 mb-6">{partner.description}</p>

                      {/* Project Details */}
                      {partner.projects?.map((project, projectIndex) => (
                        <div key={projectIndex} className="mb-6">
                          <h4 className="text-xl font-medium mb-2">{project.title}</h4>
                          <p className="text-gray-600 mb-4">{project.description}</p>
                          
                          {/* Project Images Carousel */}
                          <div className="relative h-48 rounded-lg overflow-hidden">
                            {/* Add your carousel component here */}
                            <img
                              src={project.images[0]}
                              alt={project.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      ))}

                      {/* Website Link */}
                      {partner.website && (
                        <Button
                          variant="outline"
                          className="w-full mt-4"
                          onClick={() => window.open(partner.website, '_blank')}
                        >
                          {t('partners.visitWebsite')}
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Partners; 