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
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
        <div className="md:w-1/2 w-full order-2 md:order-1 flex flex-col justify-center">
          <span className="text-gray-700 font-bold mb-2 tracking-widest text-sm uppercase" style={{ fontFamily: 'Playfair Display, serif' }}>
            {isFr ? 'SERVICE DESIGN' : 'DESIGN SERVICE'}
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
            {isFr ? 'Besoin d’aide ?' : 'Do you need any help?'}
          </h2>
          <p className="text-lg md:text-xl text-gray-700 font-medium mb-6 md:mb-8 uppercase tracking-wide" style={{ fontFamily: 'Playfair Display, serif' }}>
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
          <div className="w-full flex flex-col sm:flex-row sm:items-center gap-4">
            <RendezVousButton onClick={onRendezVousClick}>
              {isFr ? 'Prendre Rendez-vous' : 'Book an Appointment'}
            </RendezVousButton>
          </div>
        </div>
        <div className="md:w-1/2 w-full order-1 md:order-2 flex justify-center items-center gap-4 mt-8 md:mt-0">
          <img
            src="/design-service-devices.png"
            alt={isFr ? 'Aperçu du service design' : 'Design Service Devices'}
            className="max-w-[340px] md:max-w-[420px] w-full h-auto object-contain drop-shadow-xl"
          />
        </div>
      </div>
    </section>
  );
};

export default ModernStyleSection; 