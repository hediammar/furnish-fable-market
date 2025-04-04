
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Category } from '@/types/category';

interface CategoryPreviewProps {
  category: Category;
}

const CategoryPreview: React.FC<CategoryPreviewProps> = ({ category }) => {
  return (
    <div className="relative rounded-lg overflow-hidden group h-80">
      <img 
        src={category.image || 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92'}
        alt={category.name} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
        <div className="absolute bottom-0 left-0 p-6">
          <h3 className="text-white font-medium text-xl mb-1">{category.name}</h3>
          <p className="text-white/80 text-sm mb-3">{category.productCount || 0} products</p>
          <Link 
            to={`/category/${category.id}`} 
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
