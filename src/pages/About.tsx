
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
              <h1 className="font-serif text-4xl md:text-5xl font-medium mb-6">Our Story</h1>
              <p className="text-lg text-muted-foreground">
                Discover the passion and craftsmanship behind every piece of furniture we create.
              </p>
            </div>
          </div>
        </section>
        
        {/* Our History */}
        <section className="py-16">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-serif text-3xl font-medium mb-6">Our Heritage of Excellence</h2>
                <p className="text-muted-foreground mb-6">
                  Founded in 2005, Meubles Karim began as a small workshop dedicated to creating bespoke furniture for discerning clients. Our founder, Karim Benali, brought with him generations of family expertise in woodworking and a vision to blend traditional craftsmanship with contemporary design.
                </p>
                <p className="text-muted-foreground mb-6">
                  What started as a passion project quickly grew into a renowned furniture brand as word spread about the exceptional quality and stunning designs of our pieces. Today, we continue to honor our founding principles while embracing innovation and sustainability.
                </p>
                <p className="text-muted-foreground">
                  Each piece of furniture that bears our name represents our unwavering commitment to quality, beauty, and longevity—furniture that's not just built for today but designed to become tomorrow's heirlooms.
                </p>
              </div>
              <div>
                <img 
                  src="https://images.unsplash.com/photo-1560157368-946d9c8f7cb6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                  alt="Craftsman working on wooden furniture" 
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Our Values */}
        <section className="py-16 bg-muted">
          <div className="container-custom">
            <h2 className="font-serif text-3xl font-medium mb-12 text-center">Our Values</h2>
            
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
                <h3 className="text-xl font-medium mb-3">Craftsmanship</h3>
                <p className="text-muted-foreground">
                  We believe that true quality comes from meticulous attention to detail and expert craftsmanship. Each piece is carefully constructed by skilled artisans who take pride in their work.
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
                <h3 className="text-xl font-medium mb-3">Sustainability</h3>
                <p className="text-muted-foreground">
                  We're committed to responsibly sourced materials and environmentally conscious manufacturing processes. Our goal is to create beautiful furniture that doesn't come at the expense of our planet.
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
                  While respecting traditional techniques, we continuously explore new designs, materials, and technologies to create furniture that meets the evolving needs of modern living.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Our Team */}
        <section className="py-16">
          <div className="container-custom">
            <h2 className="font-serif text-3xl font-medium mb-12 text-center">The Team Behind Our Furniture</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="mb-4 relative overflow-hidden rounded-full w-48 h-48 mx-auto">
                  <img 
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                    alt="Karim Benali - Founder & Design Director" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-medium">Karim Benali</h3>
                <p className="text-muted-foreground">Founder & Design Director</p>
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
            <h2 className="font-serif text-3xl font-medium mb-6">Experience Our Collection</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Visit our showroom or browse our online catalog to discover furniture that perfectly balances form and function for your home.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/products" className="bg-white text-furniture-brown hover:bg-white/90 px-8 py-3 rounded-md font-medium">
                Browse Collection
              </a>
              <a href="/contact" className="border border-white text-white hover:bg-white/10 px-8 py-3 rounded-md font-medium">
                Contact Us
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default About;
