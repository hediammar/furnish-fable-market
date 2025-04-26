import React, { useState } from 'react';
import { Minus, Plus, Check, ShoppingCart, Info } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types/product';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProductDetailProps {
  product: Product;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0] || '');
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || '');
  const [showAssembly, setShowAssembly] = useState(false);
  const [showWarranty, setShowWarranty] = useState(false);
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const { language } = useLanguage();

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor, selectedSize);
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  return (
    <section className="py-12">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="bg-muted rounded-lg overflow-hidden">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-[500px] object-cover object-center"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  className={`rounded overflow-hidden ${
                    selectedImage === image ? 'ring-2 ring-furniture-taupe' : ''
                  }`}
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-24 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-serif font-medium mb-2">{product.name}</h1>
              <p className="text-muted-foreground">{product.category}</p>
            </div>

            <div className="flex items-center">
              <div className="text-2xl font-semibold">{language === 'fr' ? 'Prix sur demande' : 'Price on request'}</div>
            </div>

            <Separator />

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">{language === 'fr' ? 'Couleur' : 'Color'}</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <Button
                      key={color}
                      variant={selectedColor === color ? 'default' : 'outline'}
                      className="flex items-center gap-2"
                      onClick={() => setSelectedColor(color)}
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span>{color}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">{language === 'fr' ? 'Taille' : 'Size'}</h3>
                <Select
                  value={selectedSize}
                  onValueChange={setSelectedSize}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={language === 'fr' ? 'Sélectionner une taille' : 'Select a size'} />
                  </SelectTrigger>
                  <SelectContent>
                    {product.sizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="font-medium">{language === 'fr' ? 'Description' : 'Description'}</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {product.material && (
              <div className="space-y-2">
                <h3 className="font-medium">{language === 'fr' ? 'Matériau' : 'Material'}</h3>
                <p className="text-muted-foreground">{product.material}</p>
              </div>
            )}

            {product.dimensions && (
              <div className="space-y-2">
                <h3 className="font-medium">{language === 'fr' ? 'Dimensions' : 'Dimensions'}</h3>
                <p className="text-muted-foreground">
                  {product.dimensions}
                </p>
              </div>
            )}

            {/* Assembly and Warranty Toggles */}
            <div className="flex gap-4">
              {product.assembly && (
                <Toggle
                  pressed={showAssembly}
                  onPressedChange={setShowAssembly}
                  className="flex items-center gap-2"
                >
                  <Info size={16} />
                  {language === 'fr' ? 'Assemblage' : 'Assembly'}
                </Toggle>
              )}
              
              {product.warranty && (
                <Toggle
                  pressed={showWarranty}
                  onPressedChange={setShowWarranty}
                  className="flex items-center gap-2"
                >
                  <Info size={16} />
                  {language === 'fr' ? 'Garantie' : 'Warranty'}
                </Toggle>
              )}
            </div>

            {/* Assembly and Warranty Details */}
            {showAssembly && product.assembly && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">{language === 'fr' ? 'Informations d\'assemblage' : 'Assembly Information'}</h4>
                <p className="text-muted-foreground">{product.assembly}</p>
              </div>
            )}

            {showWarranty && product.warranty && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">{language === 'fr' ? 'Informations de garantie' : 'Warranty Information'}</h4>
                <p className="text-muted-foreground">{product.warranty}</p>
              </div>
            )}

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center">
                <span className="mr-4">{language === 'fr' ? 'Quantité:' : 'Quantity:'}</span>
                <div className="flex items-center border border-border rounded-md">
                  <button
                    className="px-3 py-2 text-muted-foreground hover:text-foreground"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 py-2 border-x border-border min-w-[40px] text-center">
                    {quantity}
                  </span>
                  <button
                    className="px-3 py-2 text-muted-foreground hover:text-foreground"
                    onClick={incrementQuantity}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <button
                className="btn-primary w-full flex items-center justify-center"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                {product.inStock ? (
                  <>
                    <ShoppingCart size={18} className="mr-2" />
                    {language === 'fr' ? 'Ajouter au panier' : 'Add to Cart'}
                  </>
                ) : (
                  language === 'fr' ? 'Rupture de stock' : 'Out of Stock'
                )}
              </button>

              {product.inStock && (
                <div className="flex items-center text-green-600">
                  <Check size={16} className="mr-2" />
                  <span>{language === 'fr' ? 'En stock et prêt à être expédié' : 'In stock and ready to ship'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetail;
