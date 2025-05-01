
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      <Button
  size="sm"
  onClick={() => setLanguage('fr')}
  className="w-8 h-8 p-0 rounded-full bg-no-repeat bg-center bg-cover border"
  style={{
    backgroundImage: "url('/flags/icons8-france-48.png')",
    border: language !== 'fr' ? '5px solid #ccc' : 'none',
  }}
>

</Button>

<Button
  size="sm"
  onClick={() => setLanguage('en')}
  className="w-8 h-8 p-0 rounded-full bg-no-repeat bg-center bg-cover border"
  style={{
    backgroundImage: "url('/flags/icons8-english-48.png')",
    border: language !== 'en' ? '5px solid #ccc' : 'none',
  }}
>
</Button>

    </div>
  );
};

export default LanguageSwitcher;
