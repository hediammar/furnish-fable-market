import React from 'react';
import { Helmet } from 'react-helmet-async';

const About: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>About Us | Meubles Karim</title>
        <meta name="description" content="Learn about Meubles Karim's story, our passion for quality furniture, and our commitment to exceptional craftsmanship." />
      </Helmet>
      
      <main>
        {/* Hero Section */}
        <section className="bg-muted py-16">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-serif text-4xl md:text-5xl font-medium mb-6">Notre Histoire</h1>
              <p className="text-lg text-muted-foreground">
                Découvrez la passion et l'artisanat derrière chaque meuble que nous créons.
              </p>
            </div>
          </div>
        </section>
        
        {/* Our History */}
        <section className="py-16">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-serif text-3xl font-medium mb-6">Notre Héritage d'Excellence</h2>
                <p className="text-muted-foreground mb-6">
                  Meubles Karim Hammamet est une marque unique dédiée à la fabrication de meubles modernes et contemporains par son esprit aux facettes multiples axé sur la conception, les fortes tendances, les innovations créatives.
                </p>
                <p className="text-muted-foreground mb-6">
                  Le fruit d'un pas vers l'excellence et la qualité, notre entreprise a su se développer et se faire un nom dans le domaine de l'ameublement en Tunisie. Nous sommes fiers de notre héritage et de notre savoir-faire traditionnel que nous associons aux tendances modernes pour créer des pièces uniques.
                </p>
                <p className="text-muted-foreground">
                  Chaque meuble qui porte notre nom représente notre engagement inébranlable envers la qualité, la beauté et la longévité - des meubles qui ne sont pas seulement construits pour aujourd'hui mais conçus pour devenir les héritages de demain.
                </p>
              </div>
              <div>
                <img 
                  src="https://images.unsplash.com/photo-1560157368-946d9c8f7cb6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                  alt="Artisan travaillant sur un meuble en bois" 
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Our Values */}
        <section className="py-16 bg-muted">
          <div className="container-custom">
            <h2 className="font-serif text-3xl font-medium mb-12 text-center">Nos Valeurs</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-background p-8 rounded-lg shadow-sm">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                    <path d="M7 3.6v12.8"></path>
                    <path d="M17 3.6v12.8"></path>
                    <path d="M3.6 7h16.8"></path>
                    <path d="M3.6 17h16.8"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-3">Artisanat</h3>
                <p className="text-muted-foreground">
                  Nous croyons que la vraie qualité vient d'une attention méticuleuse aux détails et d'un artisanat expert. Chaque pièce est soigneusement construite par des artisans qualifiés qui sont fiers de leur travail.
                </p>
              </div>
              
              <div className="bg-background p-8 rounded-lg shadow-sm">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M12 22v-5"></path>
                    <path d="M9 7V2"></path>
                    <path d="M15 7V2"></path>
                    <path d="M6 13V8a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0v-2a3 3 0 1 1 6 0v7"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-3">Durabilité</h3>
                <p className="text-muted-foreground">
                  Nous nous engageons à utiliser des matériaux sourcés de manière responsable et des processus de fabrication respectueux de l'environnement. Notre objectif est de créer de beaux meubles qui ne sont pas faits aux dépens de notre planète.
                </p>
              </div>
              
              <div className="bg-background p-8 rounded-lg shadow-sm">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="m4.9 4.9 14.2 14.2"></path>
                    <path d="M12 17a5 5 0 0 0 5-5c0-1.416-.582-2.699-1.525-3.63"></path>
                    <path d="M16.882 12.218A4.998 4.998 0 0 0 17 12a5 5 0 0 0-5-5c-.237 0-.47.017-.698.05"></path>
                    <path d="M6.412 6.412A5 5 0 0 0 12 17c.237 0 .47-.017.698-.05"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-3">Innovation</h3>
                <p className="text-muted-foreground">
                  Tout en respectant les techniques traditionnelles, nous explorons continuellement de nouveaux designs, matériaux et technologies pour créer des meubles qui répondent aux besoins évolutifs de la vie moderne.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Our Team */}
        <section className="py-16">
          <div className="container-custom">
            <h2 className="font-serif text-3xl font-medium mb-12 text-center">L'équipe Derrière Nos Meubles</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="mb-4 relative overflow-hidden rounded-full w-48 h-48 mx-auto">
                  <img 
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                    alt="Karim Benali - Fondateur & Directeur de Design" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-medium">Karim Benali</h3>
                <p className="text-muted-foreground">Fondateur & Directeur de Design</p>
              </div>
              
              <div className="text-center">
                <div className="mb-4 relative overflow-hidden rounded-full w-48 h-48 mx-auto">
                  <img 
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                    alt="Sophie Martin - Head of Production" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-medium">Sophie Martin</h3>
                <p className="text-muted-foreground">Head of Production</p>
              </div>
              
              <div className="text-center">
                <div className="mb-4 relative overflow-hidden rounded-full w-48 h-48 mx-auto">
                  <img 
                    src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                    alt="Marcus Chen - Lead Designer" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-medium">Marcus Chen</h3>
                <p className="text-muted-foreground">Lead Designer</p>
              </div>
              
              <div className="text-center">
                <div className="mb-4 relative overflow-hidden rounded-full w-48 h-48 mx-auto">
                  <img 
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                    alt="Isabella Rodriguez - Head of Customer Experience" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-medium">Isabella Rodriguez</h3>
                <p className="text-muted-foreground">Head of Customer Experience</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-furniture-brown text-white">
          <div className="container-custom text-center">
            <h2 className="font-serif text-3xl font-medium mb-6">Découvrez Notre Collection</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Visitez notre showroom ou parcourez notre catalogue en ligne pour découvrir des meubles qui équilibrent parfaitement forme et fonction pour votre maison.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/products" className="bg-white text-furniture-brown hover:bg-white/90 px-8 py-3 rounded-md font-medium">
                Parcourir la Collection
              </a>
              <a href="/contact" className="border border-white text-white hover:bg-white/10 px-8 py-3 rounded-md font-medium">
                Contactez-Nous
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default About;
