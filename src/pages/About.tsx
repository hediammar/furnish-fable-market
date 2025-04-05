
import { Helmet } from 'react-helmet-async';
import { Separator } from '@/components/ui/separator';

const About = () => {
  return (
    <div className="container-custom py-12 lg:py-20">
      <Helmet>
        <title>À propos | Meubles Karim</title>
      </Helmet>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-serif mb-8 text-center font-light tracking-wide">À propos de Meubles Karim</h1>
        
        <div className="mb-12">
          <img 
            src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1920&auto=format&fit=crop"
            alt="Meubles Karim showroom" 
            className="rounded-lg w-full object-cover h-96 shadow-md hover:shadow-xl transition-shadow duration-300"
          />
        </div>
        
        <div className="prose prose-stone max-w-none">
          <p className="text-lg font-medium mb-6 text-furniture-brown italic">
            Meubles Karim Hammamet est une marque unique dédiée à la fabrication de meubles modernes et contemporains par son esprit aux facettes multiples axé sur la conception, les fortes tendances, les innovations créatives.
          </p>
          
          <p className="mb-6">
            Le fruit d'un pas.
          </p>

          <h2 className="text-2xl font-serif mt-10 mb-4 font-light">Notre Histoire</h2>
          <p className="text-gray-700">
            Fondée il y a des décennies, Meubles Karim est devenue une référence dans le domaine de l'ameublement en Tunisie. Notre équipe d'artisans passionnés combine expertise traditionnelle et design contemporain pour créer des pièces uniques qui transforment les espaces de vie.
          </p>

          <h2 className="text-2xl font-serif mt-10 mb-4 font-light">Notre Philosophie</h2>
          <p className="text-gray-700">
            Nous croyons que chaque meuble raconte une histoire. La nôtre est celle d'un engagement envers la qualité, la durabilité et l'élégance intemporelle. Chaque création est pensée pour s'intégrer harmonieusement dans votre intérieur tout en reflétant votre personnalité.
          </p>
          
          <h2 className="text-2xl font-serif mt-10 mb-4 font-light">Notre Engagement</h2>
          <p className="text-gray-700">
            Chez Meubles Karim, nous nous engageons à :
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-center">
              <span className="mr-2 text-furniture-taupe">✓</span>
              Utiliser des matériaux de haute qualité
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-furniture-taupe">✓</span>
              Respecter l'environnement dans nos processus de fabrication
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-furniture-taupe">✓</span>
              Offrir un service client exceptionnel
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-furniture-taupe">✓</span>
              Innover constamment dans nos designs
            </li>
          </ul>
          
          <Separator className="my-12" />
          
          {/* Meet the Team section */}
          <h2 className="text-3xl font-serif mb-8 text-center font-light tracking-wide">Notre Équipe</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            <div className="text-center">
              <div className="relative mb-4 mx-auto w-48 h-48 overflow-hidden rounded-full border-4 border-furniture-taupe/20">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop" 
                  alt="Karim Belhadjali" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <h3 className="font-serif text-xl mb-1">Karim Belhadjali</h3>
              <p className="text-furniture-brown text-sm mb-3 italic">Fondateur & Directeur</p>
              <p className="text-gray-600 text-sm">Pionnier de la vision et de l'excellence dans l'industrie du meuble depuis plus de 30 ans.</p>
            </div>
            
            <div className="text-center">
              <div className="relative mb-4 mx-auto w-48 h-48 overflow-hidden rounded-full border-4 border-furniture-taupe/20">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop" 
                  alt="Sonia Trabelsi" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <h3 className="font-serif text-xl mb-1">Sonia Trabelsi</h3>
              <p className="text-furniture-brown text-sm mb-3 italic">Directrice Artistique</p>
              <p className="text-gray-600 text-sm">Experte en design d'intérieur, elle façonne l'esthétique de nos collections avec passion et créativité.</p>
            </div>
            
            <div className="text-center">
              <div className="relative mb-4 mx-auto w-48 h-48 overflow-hidden rounded-full border-4 border-furniture-taupe/20">
                <img 
                  src="https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?q=80&w=2076&auto=format&fit=crop" 
                  alt="Mehdi Khelifi" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <h3 className="font-serif text-xl mb-1">Mehdi Khelifi</h3>
              <p className="text-furniture-brown text-sm mb-3 italic">Maître Artisan</p>
              <p className="text-gray-600 text-sm">Avec plus de 25 ans d'expérience dans le travail du bois, il supervise la production de chaque pièce.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
