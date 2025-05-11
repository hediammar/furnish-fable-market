import React from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { CartItem as CartItemType } from '@/types/product';
import { useLanguage } from '@/context/LanguageContext';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { removeFromCart, updateCartItemQuantity } = useCart();
  const { language } = useLanguage();
  const { product, quantity } = item;

  const incrementQuantity = () => {
    updateCartItemQuantity(product.id, quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      updateCartItemQuantity(product.id, quantity - 1);
    } else {
      removeFromCart(product.id);
    }
  };

  return (
    <div className="flex items-start py-4 border-b border-border">
      {/* Product Image */}
      <div className="w-20 h-20 rounded overflow-hidden flex-shrink-0">
        <img
          src={product.images?.[0] || '/placeholder-image.jpg'}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Details */}
      <div className="ml-4 flex-grow">
        <div className="flex justify-between">
          <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
          <button
            className="text-muted-foreground hover:text-destructive p-1 -m-1"
            onClick={() => removeFromCart(product.id)}
            aria-label="Remove item"
          >
            <X size={16} />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-2">{language === 'fr' ? 'Prix sur demande' : 'Price on request'}</p>

        {/* Quantity Controls */}
        <div className="flex items-center">
          <div className="flex items-center border border-border rounded-md">
            <button
              className="px-2 py-1 text-muted-foreground hover:text-foreground"
              onClick={decrementQuantity}
            >
              <Minus size={14} />
            </button>
            <span className="px-2 py-1 text-sm border-x border-border min-w-[30px] text-center">
              {quantity}
            </span>
            <button
              className="px-2 py-1 text-muted-foreground hover:text-foreground"
              onClick={incrementQuantity}
            >
              <Plus size={14} />
            </button>
          </div>
          <span className="ml-auto font-medium text-sm">{language === 'fr' ? 'Prix sur demande' : 'Price on request'}</span>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
