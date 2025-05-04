import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Product, CartItem } from '@/types/product';
import { toast } from 'sonner';

interface CartContextType {
  cartItems: CartItem[];
  cart: CartItem[]; // Add alias for backward compatibility
  totalPrice: number; // Add totalPrice property
  addToCart: (product: Product, quantity?: number, selectedColor?: string, selectedSize?: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Calculate total price whenever cart changes
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: Product, quantity = 1, selectedColor?: string, selectedSize?: string) => {
    if (product.stock <= 0) {
      toast.error('Sorry, this product is out of stock.');
      return;
    }

    setCartItems((prevItems) => {
      // Check if the product with the same color and size is already in the cart
      const existingItemIndex = prevItems.findIndex(
        (item) => 
          item.product.id === product.id && 
          item.selectedColor === selectedColor && 
          item.selectedSize === selectedSize
      );

      // If it exists, update the quantity
      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        toast.success(`Updated quantity in cart: ${product.name}`);
        return updatedItems;
      }

      // Otherwise, add it as a new item
      toast.success(`Added to cart: ${product.name}`);
      return [...prevItems, { product, quantity, selectedColor, selectedSize }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) => {
      const itemToRemove = prevItems.find(item => item.product.id === productId);
      if (itemToRemove) {
        toast.info(`Removed from cart: ${itemToRemove.product.name}`);
      }
      return prevItems.filter((item) => item.product.id !== productId);
    });
  };

  const updateCartItemQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    toast.info('Cart has been cleared.');
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cart: cartItems, // Add alias for backward compatibility
        totalPrice,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
