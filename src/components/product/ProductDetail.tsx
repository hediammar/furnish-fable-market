import React, { useRef, useState } from 'react';
import { ChevronDown, ShoppingCart, Minus, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';

interface ProductDetailProps {
  product: Product;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || '');
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useCart();
  const { language } = useLanguage();
  const detailsRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const scrollToDetails = () => {
    detailsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize);
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen w-full">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${product.images[0]})` }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative h-full flex flex-col items-center justify-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-serif text-white text-center px-4"
          >
            {product.name}
          </motion.h1>
          
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            onClick={scrollToDetails}
            className="absolute bottom-8 text-white animate-bounce"
          >
            <ChevronDown size={32} />
          </motion.button>
        </div>
      </section>

      {/* Gallery Section */}
      {product.images.length > 0 && (
        <motion.div 
          className="relative h-[80vh] w-full overflow-hidden mt-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 flex items-center">
            {/* Previous Image */}
            <motion.div 
              className="absolute left-0 w-1/4 h-full"
              initial={{ x: -100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <img
                src={product.images[(currentImageIndex - 1 + product.images.length) % product.images.length]}
                alt="Previous"
                className="w-full h-full object-cover opacity-50"
              />
            </motion.div>

            {/* Current Image */}
            <motion.div 
              className="absolute left-1/4 w-1/2 h-full"
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <img
                src={product.images[currentImageIndex]}
                alt="Current"
                className="w-full h-full object-cover cursor-pointer"
                onClick={openModal}
              />
            </motion.div>

            {/* Next Image */}
            <motion.div 
              className="absolute right-0 w-1/4 h-full"
              initial={{ x: 100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <img
                src={product.images[(currentImageIndex + 1) % product.images.length]}
                alt="Next"
                className="w-full h-full object-cover opacity-50"
              />
            </motion.div>
          </div>

          {/* Navigation Buttons */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
            onClick={prevImage}
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
            onClick={nextImage}
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
        </motion.div>
      )}

      {/* Fullscreen Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={closeModal}>
          <div
            className="relative max-w-full max-h-screen flex items-center justify-center"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={product.images[currentImageIndex]}
              alt={`Fullscreen product view ${currentImageIndex + 1}`}
              className="object-contain h-screen w-auto max-w-full max-h-screen rounded-lg shadow-2xl"
              draggable={false}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20"
              onClick={closeModal}
              aria-label="Close image modal"
            >
              <X className="h-6 w-6 text-white" />
            </Button>
          </div>
        </div>
      )}

      {/* Product Details Section */}
      <div ref={detailsRef} className="py-16 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-serif mb-4">{product.name}</h2>
              <p className="text-lg text-muted-foreground">{product.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">{language === 'fr' ? 'Matériau' : 'Material'}</h3>
                <div className="flex items-center space-x-2">
                  {product.material?.image_url && (
                    <img 
                      src={product.material.image_url} 
                      alt={product.material.name}
                      className="w-8 h-8 object-cover rounded"
                    />
                  )}
                  <p className="text-muted-foreground">{product.material?.name}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">{language === 'fr' ? 'Textile' : 'Textile'}</h3>
                <div className="flex items-center space-x-2">
                  {product.textile?.image_url && (
                    <img 
                      src={product.textile.image_url} 
                      alt={product.textile.name}
                      className="w-8 h-8 object-cover rounded"
                    />
                  )}
                  <p className="text-muted-foreground">{product.textile?.name}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">{language === 'fr' ? 'Dimensions' : 'Dimensions'}</h3>
                <p className="text-muted-foreground">{product.dimensions}</p>
              </div>
            </div>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-medium">{language === 'fr' ? 'Taille' : 'Size'}</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? 'default' : 'outline'}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selection */}
            <div className="flex items-center justify-center gap-4">
              <span className="text-lg">{language === 'fr' ? 'Quantité:' : 'Quantity:'}</span>
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4 py-2 border-x">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={incrementQuantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="flex justify-center">
              <Button
                size="lg"
                className="w-full md:w-auto bg-[#d2ac35] hover:bg-black"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {product.inStock
                  ? language === 'fr'
                    ? 'Ajouter au panier'
                    : 'Add to Cart'
                  : language === 'fr'
                    ? 'Rupture de stock'
                    : 'Out of Stock'}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
