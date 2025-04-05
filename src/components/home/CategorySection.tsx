
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Category } from '@/types/category';
import { Link } from 'react-router-dom';

interface CategorySectionProps {
  title: string;
  subtitle: string;
  categories: Category[];
}

const CategorySection: React.FC<CategorySectionProps> = ({ title, subtitle, categories }) => {
  const { language } = useLanguage();

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-medium mb-4">{title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link 
              key={category.id}
              to={`/category/${category.id}`}
              className="group relative h-64 rounded-lg overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10 transition-opacity duration-300 group-hover:opacity-90"></div>
              <img 
                src={category.image || '/placeholder.svg'} 
                alt={category.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
                <h3 className="text-xl font-medium mb-1">{category.name}</h3>
                <p className="text-sm text-white/80 line-clamp-2">{category.description}</p>
                <span className="inline-block mt-3 font-medium text-sm border-b border-white pb-1 transition-all duration-300 group-hover:border-furniture-orange group-hover:text-furniture-cream">
                  {language === 'fr' ? 'Explorer' : 'Explore'} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
