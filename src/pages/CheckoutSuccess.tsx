
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CheckCircle, Home, Package } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const CheckoutSuccess: React.FC = () => {
  const { language } = useLanguage();
  return (
    <main className="container-custom py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <div className="mb-8 flex justify-center">
            <CheckCircle size={80} className="text-green-500" />
          </div>
          
          <h1 className="text-3xl font-serif mb-4">{language === 'fr' ? 'Merci pour votre estimation' : 'Thank you for your estimation'}</h1>
          
          <p className="text-muted-foreground mb-6">{language === 'fr' ? 'Votre estimation a été enregistrée avec succès et est en cours de traitement. Vous recevrez un email de confirmation avec les détails de votre estimation.' : 'Your estimation has been successfully placed and is being processed. You will receive a confirmation email shortly with your estimation details.'}
            
          </p>
          
          <div className="bg-muted p-6 rounded-md mb-8">
            <p className="font-medium mb-2">{language === 'fr' ? 'Informations d\'estimation: ' : 'Estimation Information: '}<span className="text-furniture-taupe">MK-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</span></p>
            <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Utilisez ce numéro pour suivre votre estimation ou pour toute question.' : 'Use this number to track your estimation or for any inquiries.'}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-furniture-taupe hover:bg-furniture-brown">
              <Link to="/">
                <Home size={18} className="mr-2" />
                {language === 'fr' ? 'Retour à la page d\'accueil' : 'Return to Home'}
              </Link>
            </Button>
            
            <Button asChild variant="outline">
              <Link to="/estimates">
                <Package size={18} className="mr-2" />
                {language === 'fr' ? 'Voir mes estimations' : 'View My Estimates'}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CheckoutSuccess;
