
import React from 'react';
import { ArrowRight } from 'lucide-react';
import Hero from '@/components/home/Hero';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import { Product } from '@/types/product';

// Mock data for featured products
const featuredProducts: Product[] = [
  {
    id: '1',
    name: 'Milan Leather Sofa',
    description: 'A luxurious Italian leather sofa with clean lines and timeless design. Perfect for modern living spaces.',
    price: 1899.99,
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      'https://images.unsplash.com/photo-1524758834226-5cc762c8c73d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    ],
    category: 'Living Room',
    material: 'Italian Leather, Solid Oak',
    dimensions: {
      width: 220,
      height: 85,
      depth: 95,
      unit: 'cm'
    },
    inStock: true,
    featured: true
  },
  {
    id: '2',
    name: 'Oslo Dining Table',
    description: 'Scandinavian-inspired dining table made from solid oak with a beautiful natural finish.',
    price: 1299.99,
    images: [
      'https://images.unsplash.com/photo-1532372576444-dda954194ad0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      'https://images.unsplash.com/photo-1533090368676-1fd25485db88?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      'https://images.unsplash.com/photo-1532372320572-cda25653a26d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    ],
    category: 'Dining',
    material: 'Solid Oak, Stainless Steel',
    dimensions: {
      width: 180,
      height: 75,
      depth: 90,
      unit: 'cm'
    },
    inStock: true,
    featured: true
  },
  {
    id: '3',
    name: 'Vienna Bed Frame',
    description: 'Elegant bed frame with a padded headboard, combining style and comfort for your bedroom.',
    price: 899.99,
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      'https://images.unsplash.com/photo-1505693314001-a7348a4d160b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    ],
    category: 'Bedroom',
    material: 'Solid Wood, Upholstered Fabric',
    dimensions: {
      width: 160,
      height: 120,
      depth: 210,
      unit: 'cm'
    },
    inStock: true,
    featured: true,
    new: true
  }
];

const Index: React.FC = () => {
  return (
    <main>
      <Hero />
      <FeaturedProducts products={featuredProducts} />
      
      {/* Categories Section */}
      <section className="py-16">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-serif font-medium mb-12 text-center">Shop by Room</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Living Room */}
            <div className="relative rounded-lg overflow-hidden group h-80">
              <img 
                src="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                alt="Living Room" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="text-white font-medium text-xl mb-2">Living Room</h3>
                  <a href="/category/living-room" className="text-white hover:text-furniture-taupe inline-flex items-center text-sm">
                    Shop Collection <ArrowRight size={14} className="ml-1" />
                  </a>
                </div>
              </div>
            </div>
            
            {/* Bedroom */}
            <div className="relative rounded-lg overflow-hidden group h-80">
              <img 
                src="https://images.unsplash.com/photo-1505693314001-a7348a4d160b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                alt="Bedroom" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="text-white font-medium text-xl mb-2">Bedroom</h3>
                  <a href="/category/bedroom" className="text-white hover:text-furniture-taupe inline-flex items-center text-sm">
                    Shop Collection <ArrowRight size={14} className="ml-1" />
                  </a>
                </div>
              </div>
            </div>
            
            {/* Dining */}
            <div className="relative rounded-lg overflow-hidden group h-80">
              <img 
                src="https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                alt="Dining" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="text-white font-medium text-xl mb-2">Dining</h3>
                  <a href="/category/dining" className="text-white hover:text-furniture-taupe inline-flex items-center text-sm">
                    Shop Collection <ArrowRight size={14} className="ml-1" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section className="py-16 bg-muted">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                alt="Our workshop" 
                className="rounded-lg shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-medium mb-6">Craftsmanship in Every Detail</h2>
              <p className="text-muted-foreground mb-6">
                At Meubles Karim, we believe that furniture is more than just functional—it's an expression of your style and taste. Our pieces are meticulously crafted by skilled artisans using the finest materials and techniques passed down through generations.
              </p>
              <p className="text-muted-foreground mb-8">
                Every curve, every joint, and every finish is executed with precision and care, resulting in furniture that's not only beautiful but built to last for generations.
              </p>
              <a href="/about" className="btn-secondary inline-flex">
                Our Story
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
