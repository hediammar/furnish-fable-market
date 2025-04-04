
import { Helmet } from 'react-helmet-async';
import { Separator } from '@/components/ui/separator';

const About = () => {
  return (
    <div className="container-custom py-12">
      <Helmet>
        <title>À propos | Meubles Karim</title>
      </Helmet>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-serif mb-8 text-center">À propos de Meubles Karim</h1>
        
        <div className="mb-12">
          <img 
            src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1920&auto=format&fit=crop"
            alt="Meubles Karim showroom" 
            className="rounded-lg w-full object-cover h-96"
          />
        </div>
        
        <div className="prose prose-stone max-w-none">
          <p className="text-lg font-medium mb-6">
            Meubles Karim Hammamet est une marque unique dédiée à la fabrication de meubles modernes et contemporains par son esprit aux facettes multiples axé sur la conception, les fortes tendances, les innovations créatives.
          </p>
          
          <p className="mb-6">
            Le fruit d'un pas.
          </p>

          <h2 className="text-2xl font-serif mt-10 mb-4">Notre Histoire</h2>
          <p>
            Fondée il y a des décennies, Meubles Karim est devenue une référence dans le domaine de l'ameublement en Tunisie. Notre équipe d'artisans passionnés combine expertise traditionnelle et design contemporain pour créer des pièces uniques qui transforment les espaces de vie.
          </p>

          <h2 className="text-2xl font-serif mt-10 mb-4">Notre Philosophie</h2>
          <p>
            Nous croyons que chaque meuble raconte une histoire. La nôtre est celle d'un engagement envers la qualité, la durabilité et l'élégance intemporelle. Chaque création est pensée pour s'intégrer harmonieusement dans votre intérieur tout en reflétant votre personnalité.
          </p>
          
          <h2 className="text-2xl font-serif mt-10 mb-4">Notre Engagement</h2>
          <p>
            Chez Meubles Karim, nous nous engageons à :
          </p>
          <ul>
            <li>Utiliser des matériaux de haute qualité</li>
            <li>Respecter l'environnement dans nos processus de fabrication</li>
            <li>Offrir un service client exceptionnel</li>
            <li>Innover constamment dans nos designs</li>
          </ul>
          
          <Separator className="my-10" />
          
          <h2 className="text-2xl font-serif mb-6">Contactez-nous</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div>
              <h3 className="font-semibold mb-2">Adresse</h3>
              <p>Route Hammamet Nord vers Nabeul, Hammamet, Tunisia, 8050</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Téléphone</h3>
              <p>+216 72 260 360</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Email</h3>
              <p>contactmkarim@gmail.com</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Heures d'ouverture</h3>
              <p>Lundi - Samedi: 9h00 - 18h00</p>
              <p>Dimanche: Fermé</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
