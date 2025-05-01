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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-10">
            {[
              {
                name: 'Karim Belhadjali',
                role: 'Fondateur & Directeur',
                img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop',
                info: "Pionnier de la vision et de l'excellence dans l'industrie du meuble depuis plus de 30 ans.",
                color: 'bg-yellow-100',
              },
              {
                name: 'Sonia Trabelsi',
                role: 'Directrice Artistique',
                img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop',
                info: "Experte en design d'intérieur, elle façonne l'esthétique de nos collections avec passion et créativité.",
                color: 'bg-purple-100',
              },
              {
                name: 'Mehdi Khelifi',
                role: 'Maître Artisan',
                img: 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?q=80&w=2076&auto=format&fit=crop',
                info: "Avec plus de 25 ans d'expérience dans le travail du bois, il supervise la production de chaque pièce.",
                color: 'bg-green-100',
              },
              {
                name: 'Nouha Ben Salah',
                role: 'Responsable Clientèle',
                img: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1974&auto=format&fit=crop',
                info: "Toujours à l'écoute, elle veille à la satisfaction de chaque client avec professionnalisme.",
                color: 'bg-cyan-100',
              },
            ].map((member, idx) => (
              <div
                key={member.name}
                className={`group relative rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105 cursor-pointer ${member.color}`}
                style={{ minHeight: '260px', height: '260px' }}
              >
                {/* Full card image */}
                <img
                  src={member.img}
                  alt={member.name}
                  className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-110 z-0"
                />
                {/* Fade-in gradient from bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-90 z-10 transition-opacity duration-300" />
                {/* Name and role at the bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
                  <h3 className="text-white text-lg font-semibold mb-1 drop-shadow-lg">{member.name}</h3>
                  <p className="text-white text-xs mb-1 italic drop-shadow-lg">{member.role}</p>
                </div>
                {/* Hover info overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                  <h3 className="text-white text-lg font-semibold mb-2">{member.name}</h3>
                  <p className="text-furniture-taupe text-xs mb-2 italic">{member.role}</p>
                  <p className="text-white text-xs">{member.info}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
