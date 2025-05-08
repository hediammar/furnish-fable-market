import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { fetchPartners } from '@/services/partnerService';
import { Partner, Project } from '@/types/partner';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Define a local type for projects with partner_id
type ProjectWithPartner = Project & { partner_id: string };

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Fetch all partners with their projects
  const { data: partners = [], isLoading } = useQuery({
    queryKey: ['partners'],
    queryFn: fetchPartners,
  });

  // Get all projects from all partners, attaching partner_id dynamically
  const allProjects: ProjectWithPartner[] = partners.reduce<ProjectWithPartner[]>((acc, partner) => {
    if (partner.projects) {
      const projectsWithPartner = partner.projects.map(project => ({
        ...project,
        partner_id: partner.id,
      }));
      return [...acc, ...projectsWithPartner];
    }
    return acc;
  }, []);

  // Filter projects based on search query and selected category
  const filteredProjects = allProjects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || project.project_category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get the last 10 projects for the carousel
  const recentProjects = allProjects.slice(-10);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Helmet>
        <title>{language === 'fr' ? 'Projets' : 'Projects'} | Meubles Karim</title>
      </Helmet>

      {/* Swiper Carousel Hero Section */}
      <div className="w-full bg-white">
        <Swiper
          modules={[Navigation, Pagination, A11y, Autoplay]}
          slidesPerView={1}
          spaceBetween={32}
          centeredSlides
          loop
          autoplay={{ delay: 2000, disableOnInteraction: false }}
          breakpoints={{
            768: { slidesPerView: 1.5, spaceBetween: 32 },
            1024: { slidesPerView: 2.5, spaceBetween: 32 },
            1280: { slidesPerView: 3, spaceBetween: 32 },
          }}
          className="project-hero-swiper py-12 md:py-16"
        >
          {recentProjects.map((project, idx) => (
            <SwiperSlide key={project.id}>
              {({ isActive, isPrev, isNext }) => (
                <div
                  className={`relative group cursor-pointer h-[50vw] max-h-[520px] rounded-lg overflow-hidden shadow-lg transition-all duration-500
                    ${isActive ? 'z-20 scale-105' : 'z-10 scale-95'}
                  `}
                  onClick={() => navigate(`/partners/${project.partner_id}`)}
                  style={{ minHeight: 320 }}
                >
                  <img
                    src={project.images[0]}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500"
                  />
                  {/* Overlay for unfocused slides */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-black/60 transition-opacity duration-300 z-10" />
                  )}
                  {/* Find out more overlay on hover for center slide */}
                  {isActive && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-80 transition-opacity duration-300 z-10 flex flex-col justify-end">
                      <a
                        href="#"
                        className="w-full text-center text-white text-lg md:text-xl font-serif mb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ fontFamily: 'Didot, serif' }}
                      >
                        {language === 'fr' ? 'Découvrir plus' : 'Find out more'}
                      </a>
                    </div>
                  )}
                  <div className="absolute bottom-8 left-0 w-full z-20 flex justify-center">
                    <h2
                      className="text-2xl md:text-3xl font-serif text-white text-center drop-shadow-lg px-4"
                      style={{ fontFamily: 'Didot, serif', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
                    >
                      {project.title}
                    </h2>
                  </div>
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Projects Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-serif text-center mb-12" style={{ fontFamily: 'Didot, serif' }}>
          {language === 'fr' ? 'Projets' : 'Projects'}
        </h2>

        {/* Filters */}
<div className="w-full flex justify-center">
  <div className="w-full max-w-3xl flex flex-col md:flex-row gap-4 mb-12 px-4">
    <Select
      value={selectedCategory}
      onValueChange={setSelectedCategory}
    >
      <SelectTrigger className="w-full md:w-[200px]">
        <SelectValue placeholder={language === 'fr' ? 'Catégorie' : 'Category'} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="All">{language === 'fr' ? 'Tous' : 'All'}</SelectItem>
        <SelectItem value="Hotels">{language === 'fr' ? 'Hôtels' : 'Hotels'}</SelectItem>
        <SelectItem value="Villas">{language === 'fr' ? 'Villas' : 'Villas'}</SelectItem>
        <SelectItem value="Restaurants">{language === 'fr' ? 'Restaurants' : 'Restaurants'}</SelectItem>
        <SelectItem value="Coffee shops">{language === 'fr' ? 'Cafés' : 'Coffee shops'}</SelectItem>
      </SelectContent>
    </Select>

    <Input
      type="text"
      placeholder={language === 'fr' ? 'Rechercher un projet...' : 'Search projects...'}
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="flex-1"
    />
  </div>
</div>


        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              className="group cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              onClick={() => navigate(`/partners/${project.partner_id}`)}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                <img
                  src={project.images[0]}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <h3 className="mt-4 text-xl font-serif text-center" style={{ fontFamily: 'Didot, serif' }}>
                {project.title}
              </h3>
            </motion.div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            {language === 'fr' ? 'Aucun projet trouvé' : 'No projects found'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects; 