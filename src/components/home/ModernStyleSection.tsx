import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import RendezVousButton from '../ui/RendezVousButton';

interface ModernStyleSectionProps {
  onRendezVousClick?: () => void;
}

const ModernStyleSection: React.FC<ModernStyleSectionProps> = ({ onRendezVousClick }) => {
  const { language } = useLanguage();
  const isFr = language === 'fr';

  return (
    <section className="relative py-0 bg-white min-h-[400px] flex items-center justify-center">
      {/* Full-width background image */}
      <img
        src="/interior-design-neoclassical-style-with-furnishings-decor_23-2151199323.jpg"
        alt={isFr ? 'Aperçu du service design' : 'Design Service Devices'}
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      {/* Optional: dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40 z-10" />
      {/* Centered content */}
      <div className="relative z-20 flex flex-col items-center justify-center w-full px-4 py-16">
        <span className="text-white font-bold tracking-widest text-sm uppercase drop-shadow-lg mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
          {isFr ? 'SERVICE DESIGN' : 'DESIGN SERVICE'}
        </span>
        <h2 className="text-3xl md:text-5xl text-white font-serif font-bold mb-4 leading-tight drop-shadow-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
          {isFr ? 'Besoin d’aide ?' : 'Do you need any help?'}
        </h2>
        <p className="text-lg md:text-xl text-white font-medium mb-6 md:mb-8 uppercase tracking-wide text-center drop-shadow-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
          {isFr
            ? (
              <>
                NOUS VOUS INVITONS À PRENDRE CONTACT AVEC NOTRE ÉQUIPE DESIGN EN SHOWROOM.<br />
                PRENEZ RENDEZ-VOUS EN MAGASIN OU<br />
                OPTEZ POUR UN APPEL VIDÉO POUR EXPLORER LES PRODUITS QUI VOUS INTÉRESSENT.
              </>
            )
            : (
              <>
                WE INVITE YOU TO CONNECT WITH OUR SHOWROOM DESIGN TEAM.<br />
                FEEL FREE TO SCHEDULE AN IN-STORE APPOINTMENT OR<br />
                A CONVENIENT VIDEO CALL TO FURTHER EXPLORE THE PRODUCTS YOU ARE MOST INTERESTED IN.
              </>
            )}
        </p>
        <div className="w-full flex flex-col sm:flex-row sm:items-center gap-4 max-w-xs mx-auto">
          <RendezVousButton onClick={onRendezVousClick}>
            {isFr ? 'Prendre Rendez-vous' : 'Book an Appointment'}
          </RendezVousButton>
        </div>
      </div>
    </section>
  );
};

export default ModernStyleSection; 