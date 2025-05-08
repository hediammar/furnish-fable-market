import React from 'react';
import { ArrowRight } from 'lucide-react';

const ModernMinimalistSection: React.FC = () => (
  <section className="py-16 bg-white">
    <div className="container mx-auto px-4 flex flex-col md:flex-row gap-8 items-stretch">
      {/* Left: Main image and title */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
            alt="Modern Minimalist Living Room"
            className="rounded-2xl shadow-lg w-full h-64 md:h-80 object-cover mb-6"
          />
        </div>
        <div className="mt-2">
          <span className="inline-block bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full mb-2">Georgous interior</span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold leading-tight">Modern Minimalist</h2>
        </div>
      </div>
      {/* Right: Stacked cards */}
      <div className="flex flex-col gap-6 w-full md:w-[340px] max-w-[340px]">
        {/* Top card */}
        <div className="bg-[#F6F4F0] rounded-2xl p-6 flex flex-col gap-2 shadow-sm">
          <span className="inline-block bg-white text-gray-700 text-xs px-3 py-1 rounded-full mb-2 self-start">Aesthetic</span>
          <h3 className="text-xl font-semibold mb-1">Into a gallery of elegance</h3>
          <p className="text-gray-500 text-sm">Aesthetic furniture where every piece tells a story of style</p>
        </div>
        {/* Bottom card with image */}
        <div className="relative rounded-2xl overflow-hidden shadow-lg h-40 flex items-end">
          <img
            src="https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=400&q=80"
            alt="Artistry Living"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="relative z-10 p-4 w-full flex flex-col gap-2">
            <span className="inline-block bg-white/80 text-gray-700 text-xs px-3 py-1 rounded-full mb-1 self-start">Best Furniture</span>
            <span className="text-white text-sm font-medium drop-shadow">Indulge in the artistry of everyday living</span>
          </div>
          <LinkButton />
        </div>
      </div>
    </div>
  </section>
);

const LinkButton = () => (
  <button
    className="absolute bottom-4 right-4 bg-white text-black rounded-full p-2 shadow-md hover:bg-black hover:text-white transition-colors duration-300 z-20"
    aria-label="Explore"
  >
    <ArrowRight className="w-5 h-5" />
  </button>
);

export default ModernMinimalistSection; 