
import React from 'react';
import { useParams } from 'react-router-dom';
import ProductDetail from '@/components/product/ProductDetail';
import { Product } from '@/types/product';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data for a single product
const productData: Product = {
  id: '1',
  name: 'Milan Leather Sofa',
  description: 'A luxurious Italian leather sofa with clean lines and timeless design. Perfect for modern living spaces. The Milan Leather Sofa features down-filled cushions for exceptional comfort and a kiln-dried hardwood frame for durability and stability. The rich, full-grain leather develops a beautiful patina over time, making each piece unique.',
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
};

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // In a real app, you would fetch the product data based on the ID
  // For now, we'll just use our mock data
  const product = productData;
  
  // Breadcrumb categories
  const categories = [
    { name: 'Home', path: '/' },
    { name: product.category, path: `/category/${product.category.toLowerCase().replace(' ', '-')}` },
    { name: product.name, path: '#' }
  ];

  return (
    <main>
      {/* Breadcrumb */}
      <div className="bg-muted py-3">
        <div className="container-custom">
          <div className="flex items-center text-sm">
            {categories.map((category, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="mx-2 text-muted-foreground">/</span>}
                {index === categories.length - 1 ? (
                  <span className="text-muted-foreground">{category.name}</span>
                ) : (
                  <Link to={category.path} className="hover:text-furniture-brown text-muted-foreground">
                    {category.name}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      
      {/* Product Detail */}
      <ProductDetail product={product} />
      
      {/* Back to products link */}
      <div className="container-custom py-8">
        <Link 
          to="/products" 
          className="inline-flex items-center text-furniture-brown hover:text-furniture-teal"
        >
          <ArrowLeft size={16} className="mr-2" /> Back to all products
        </Link>
      </div>
    </main>
  );
};

export default ProductPage;
