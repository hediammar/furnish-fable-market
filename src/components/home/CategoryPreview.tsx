
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface CategoryPreviewProps {
  category: {
    id: string;
    name: string;
    productCount: number;
    image: string;
  };
}

const CategoryPreview: React.FC<CategoryPreviewProps> = ({ category }) => {
  return (
    <div className="relative rounded-lg overflow-hidden group h-80">
      <img 
        src={category.image}
        alt={category.name} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
        <div className="absolute bottom-0 left-0 p-6">
          <h3 className="text-white font-medium text-xl mb-1">{category.name}</h3>
          <p className="text-white/80 text-sm mb-3">{category.productCount} products</p>
          <Link 
            to={`/category/${category.name.toLowerCase().replace(' ', '-')}`} 
            className="text-white hover:text-furniture-taupe inline-flex items-center text-sm"
          >
            Shop Collection <ArrowRight size={14} className="ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CategoryPreview;
