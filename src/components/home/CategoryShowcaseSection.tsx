import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Category } from '@/types/category';

interface Props {
  title: string;
  subtitle: string;
  categories: Category[];
}

const description =
  'Poliform will showcase its vision of contemporary architecture, interior design trends, and innovative living at Salone del Mobile.Milano 2024.';

const getColumnCards = (categories: Category[]) => {
  // Split into 3 columns, alternating tall/short
  const cols = [[], [], []];
  for (let i = 0; i < 6; i++) {
    if (i < categories.length) {
      cols[i % 3].push(categories[i]);
    }
  }
  return cols;
};

const CategoryShowcaseSection: React.FC<Props> = ({ title, subtitle, categories }) => {
  const cols = getColumnCards(categories.slice(0, 6));
  return (
    <section className="flex flex-col h-screen bg-white overflow-hidden">
      <div className="w-full px-0 md:container md:mx-auto md:px-4 flex flex-col h-full">
        <div className="flex-none flex flex-col md:flex-row md:items-start md:justify-between mt-2 mb-2 md:mt-6 md:mb-6 gap-2 md:gap-4">
          <div>
            <h2 className="text-xl md:text-4xl font-serif font-medium mb-1 md:mb-4">{title}</h2>
          </div>
          <div className="flex flex-col items-end gap-1 md:gap-4 md:w-1/2">
            <Link
              to="/products"
              className="inline-flex items-center bg-[#d2ac30] text-white px-3 md:px-5 py-2 rounded-md font-medium hover:bg-[#ffe48b] transition-colors duration-300 text-xs md:text-sm self-end"
            >
              View More <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <p className="text-gray-500 text-right max-w-xs text-xs md:text-sm hidden md:block">{description}</p>
          </div>
        </div>
        <div className="flex-1 min-h-0 flex items-end overflow-hidden">
          <div className="grid grid-cols-3 gap-2 md:gap-4 w-full h-full overflow-hidden">
            {cols.map((col, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-2 md:gap-4 w-full h-full flex-1 min-h-0">
                {col.map((cat, idx) => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.name}`}
                    className={`relative rounded-2xl overflow-hidden shadow-lg group flex-1 min-h-0 h-0 w-full flex`}
                  >
                    <img
                      src={cat.image || '/placeholder.svg'}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-2 left-2 z-10 flex items-center gap-2">
                      <span className="text-white text-base md:text-lg font-semibold drop-shadow-lg bg-black/40 px-2 md:px-3 py-1 rounded-lg">{cat.name}</span>
                    </div>
                    <span className="absolute bottom-2 right-2 bg-white text-black rounded-full p-2 shadow-md flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors duration-300 z-10">
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-0" />
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcaseSection; 