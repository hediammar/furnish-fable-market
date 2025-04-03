
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative h-[90vh] overflow-hidden">
      {/* Hero Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
          alt="Elegant living room with modern furniture" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30"></div>
      </div>
      
      {/* Content */}
      <div className="container-custom relative z-10 h-full flex flex-col justify-center text-white">
        <div className="max-w-2xl animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-6">
            Elegant Furniture for Modern Living
          </h1>
          <p className="text-lg md:text-xl mb-8 text-white/90 max-w-xl">
            Discover our curated collection of high-quality furniture that combines style, comfort, and craftsmanship.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/products" className="bg-white text-furniture-brown hover:bg-furniture-taupe hover:text-white font-medium px-8 py-3 rounded-md transition-colors duration-300 flex items-center">
              Shop Now <ArrowRight size={16} className="ml-2" />
            </Link>
            <Link to="/about" className="bg-transparent border border-white text-white hover:bg-white/10 font-medium px-8 py-3 rounded-md transition-colors duration-300">
              Our Story
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
