import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Product } from '@/types/product';

interface Props {
  title: string;
  subtitle: string;
  products: Product[];
}

const FeaturedProducts: React.FC<Props> = ({ title, subtitle, products }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const productsPerView = 3;
  const totalProducts = products.length;

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalProducts);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalProducts) % totalProducts);
  };

  const visibleProducts = products.slice(currentIndex, currentIndex + productsPerView);

  // Ensure we always have 3 products in view
  const adjustedProducts = visibleProducts.length < productsPerView
    ? [...visibleProducts, ...products.slice(0, productsPerView - visibleProducts.length)]
    : visibleProducts;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-medium mb-4">{title}</h2>
            <p className="text-muted-foreground max-w-2xl">{subtitle}</p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center bg-gray-900 text-white px-5 py-2 rounded-md font-medium hover:bg-gray-700 transition-colors duration-300 text-sm self-end"
          >
            View More <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
        <div className="relative flex items-center">
          <button onClick={prevSlide} className="absolute left-0 z-10 bg-white rounded-full p-2 shadow-md">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex justify-center gap-6 w-full transition-transform duration-300 ease-in-out">
            {adjustedProducts.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="flex-none w-1/3 group rounded-2xl overflow-hidden shadow-lg bg-white hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={product.images[0] || '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
                  </div>
                  <span className="mt-4 inline-block text-furniture-orange font-medium group-hover:underline">
                    View Product →
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <button onClick={nextSlide} className="absolute right-0 z-10 bg-white rounded-full p-2 shadow-md">
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
