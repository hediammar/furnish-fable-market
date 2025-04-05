
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      <Button 
        variant={language === 'fr' ? 'default' : 'outline'} 
        size="sm" 
        onClick={() => setLanguage('fr')}
        className="text-xs px-2 py-1 h-8"
      >
        FR
      </Button>
      <Button 
        variant={language === 'en' ? 'default' : 'outline'} 
        size="sm" 
        onClick={() => setLanguage('en')}
        className="text-xs px-2 py-1 h-8"
      >
        EN
      </Button>
    </div>
  );
};

export default LanguageSwitcher;
