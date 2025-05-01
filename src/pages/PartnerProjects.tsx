import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPartnerById } from '@/services/partnerService';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Partner, Project } from '@/types/partner';

const PartnerProjects: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset scroll position when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: partner, isLoading } = useQuery({
    queryKey: ['partner', id],
    queryFn: () => fetchPartnerById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <p className="text-xl text-muted-foreground">
          {language === 'fr' ? 'Partenaire non trouvé' : 'Partner not found'}
        </p>
      </div>
    );
  }

  const project = partner.projects?.[0];
  const images = project?.images || [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Helmet>
        <title>{project?.title || partner.name} | {language === 'fr' ? 'Projets' : 'Projects'} | Meubles Karim</title>
      </Helmet>

      {/* Full Screen Hero Section */}
      <motion.div 
        className="relative h-screen w-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {images[0] && (
          <motion.img
            src={images[0]}
            alt={project?.title || partner.name}
            className="w-full h-full object-cover"
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        )}
        <motion.div 
          className="absolute inset-0 bg-black/40 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <motion.div
            className="text-center"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.h1 
              className="text-6xl md:text-8xl font-serif font-medium text-white mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              {project?.title || partner.name}
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              
            </motion.p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Image Carousel Section */}
      {images.length > 0 && (
        <motion.div 
          className="relative h-[80vh] w-full overflow-hidden mt-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 flex items-center">
            {/* Previous Image */}
            <motion.div 
              className="absolute left-0 w-1/4 h-full"
              initial={{ x: -100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <img
                src={images[(currentImageIndex - 1 + images.length) % images.length]}
                alt="Previous"
                className="w-full h-full object-cover opacity-50"
              />
            </motion.div>

            {/* Current Image */}
            <motion.div 
              className="absolute left-1/4 w-1/2 h-full"
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <img
                src={images[currentImageIndex]}
                alt="Current"
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setSelectedImage(images[currentImageIndex])}
              />
            </motion.div>

            {/* Next Image */}
            <motion.div 
              className="absolute right-0 w-1/4 h-full"
              initial={{ x: 100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <img
                src={images[(currentImageIndex + 1) % images.length]}
                alt="Next"
                className="w-full h-full object-cover opacity-50"
              />
            </motion.div>
          </div>

          {/* Navigation Buttons */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
            onClick={prevImage}
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
            onClick={nextImage}
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
        </motion.div>
      )}

      {/* Project Information Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Column - Project Description */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-serif font-medium mb-8">
              {language === 'fr' ? 'À propos du projet' : 'About the Project'}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {project?.description}
            </p>
          </motion.div>

          {/* Right Column - Partner Information */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="mb-8">
              <h2 className="text-3xl font-serif font-medium mb-4">
                {language === 'fr' ? 'À propos du partenaire' : 'About the Partner'}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {partner.description}
              </p>
            </div>

            {partner.website && (
              <Button
                variant="outline"
                className="group relative overflow-hidden"
                onClick={() => window.open(partner.website, '_blank')}
              >
                <span className="relative z-10 flex items-center">
                  {language === 'fr' ? 'Voir le site' : 'Visit Website'}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </span>
                <motion.span 
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.div 
              className="relative max-w-6xl w-full max-h-[90vh]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={selectedImage}
                alt="Project"
                className="w-full h-full object-contain rounded-lg"
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 bg-white/10 hover:bg-white/20"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="h-6 w-6 text-white" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PartnerProjects; 