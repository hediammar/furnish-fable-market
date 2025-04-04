import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Banknote, Home, Truck, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type PaymentMethod = 'credit_card' | 'bank_transfer' | 'on_site' | 'on_delivery';

interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  paymentMethod: PaymentMethod;
}

const Checkout: React.FC = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { register, handleSubmit, formState: { errors }, watch } = useForm<CheckoutFormData>();
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const paymentMethod = watch('paymentMethod', 'credit_card');

  const onSubmit = async (data: CheckoutFormData) => {
    setProcessing(true);
    
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to complete your order.",
          variant: "destructive",
        });
        navigate('/auth', { state: { from: '/checkout' } });
        return;
      }
      
      const orderData = {
        user_id: user.id,
        shipping_address: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          zipCode: data.zipCode,
          country: data.country
        },
        status: 'pending',
        payment_method: data.paymentMethod,
        total_amount: totalPrice + (totalPrice * 0.15)
      };
      
      const { data: orderResponse, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select('id')
        .single();
      
      if (orderError) {
        console.error('Error creating order:', orderError);
        throw new Error(orderError.message);
      }
      
      const orderItems = cartItems.map(item => ({
        order_id: orderResponse.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) {
        console.error('Error adding order items:', itemsError);
        throw new Error(itemsError.message);
      }
      
      toast({
        title: "Order successful!",
        description: "We've received your order and will process it shortly.",
      });
      
      clearCart();
      
      navigate('/checkout/success');
    } catch (error) {
      console.error('Error processing order:', error);
      toast({
        title: "Error processing order",
        description: "There was a problem processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container-custom py-16 text-center">
        <h2 className="text-2xl font-medium mb-4">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8">
          Add some products to your cart before proceeding to checkout.
        </p>
        <Button asChild>
          <Link to="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <main className="py-12 bg-background">
      <Helmet>
        <title>Checkout | Meubles Karim</title>
        <meta name="description" content="Checkout and complete your purchase" />
      </Helmet>
      
      <div className="container-custom">
        <Link to="/cart" className="flex items-center mb-8 text-furniture-taupe hover:text-furniture-brown">
          <ArrowLeft size={18} className="mr-2" />
          Back to Cart
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-serif mb-6">Checkout</h1>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-medium mb-6">Shipping Information</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                    <Input 
                      id="firstName" 
                      {...register('firstName', { required: 'First name is required' })} 
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm">{errors.firstName.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                    <Input 
                      id="lastName" 
                      {...register('lastName', { required: 'Last name is required' })} 
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                    <Input 
                      id="email" 
                      type="email" 
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                      })} 
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm">{errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
                    <Input 
                      id="phone" 
                      {...register('phone', { required: 'Phone number is required' })} 
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm">{errors.phone.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
                  <Input 
                    id="address" 
                    {...register('address', { required: 'Address is required' })} 
                    className={errors.address ? 'border-red-500' : ''}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm">{errors.address.message}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
                    <Input 
                      id="city" 
                      {...register('city', { required: 'City is required' })} 
                      className={errors.city ? 'border-red-500' : ''}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm">{errors.city.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code <span className="text-red-500">*</span></Label>
                    <Input 
                      id="zipCode" 
                      {...register('zipCode', { required: 'ZIP code is required' })} 
                      className={errors.zipCode ? 'border-red-500' : ''}
                    />
                    {errors.zipCode && (
                      <p className="text-red-500 text-sm">{errors.zipCode.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country">Country <span className="text-red-500">*</span></Label>
                    <Input 
                      id="country" 
                      {...register('country', { required: 'Country is required' })} 
                      className={errors.country ? 'border-red-500' : ''}
                    />
                    {errors.country && (
                      <p className="text-red-500 text-sm">{errors.country.message}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-medium mb-6">Payment Method</h2>
                
                <RadioGroup 
                  defaultValue="credit_card"
                  className="space-y-4"
                  {...register('paymentMethod', { required: true })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="credit_card" id="credit_card" />
                    <Label htmlFor="credit_card" className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Credit Card
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                    <Label htmlFor="bank_transfer" className="flex items-center">
                      <Banknote className="h-5 w-5 mr-2" />
                      Bank Transfer
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="on_site" id="on_site" />
                    <Label htmlFor="on_site" className="flex items-center">
                      <Home className="h-5 w-5 mr-2" />
                      Pay On-Site
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="on_delivery" id="on_delivery" />
                    <Label htmlFor="on_delivery" className="flex items-center">
                      <Truck className="h-5 w-5 mr-2" />
                      Pay On Delivery
                    </Label>
                  </div>
                </RadioGroup>
                
                {paymentMethod === 'credit_card' && (
                  <div className="mt-6 p-4 border border-muted rounded-md">
                    <p className="text-muted-foreground mb-4">
                      We'll redirect you to our secure payment processor to complete your purchase. 
                      Your card information is encrypted and secure.
                    </p>
                  </div>
                )}
                
                {paymentMethod === 'bank_transfer' && (
                  <div className="mt-6 p-4 border border-muted rounded-md">
                    <p className="font-medium mb-2">Bank Transfer Details:</p>
                    <p className="text-muted-foreground mb-1">Bank: Bank of Furniture</p>
                    <p className="text-muted-foreground mb-1">Account Name: Meubles Karim</p>
                    <p className="text-muted-foreground mb-1">Account Number: 123456789</p>
                    <p className="text-muted-foreground mb-1">IBAN: FR76 1234 5678 9123 4567 8912 345</p>
                    <p className="text-muted-foreground mt-2">
                      Please include your order number in the transfer reference.
                    </p>
                  </div>
                )}
                
                {(paymentMethod === 'on_site' || paymentMethod === 'on_delivery') && (
                  <div className="mt-6 p-4 border border-muted rounded-md">
                    <p className="text-muted-foreground">
                      {paymentMethod === 'on_site' 
                        ? 'You can pay in cash, credit card, or debit card when you visit our store to pick up your order.' 
                        : 'You can pay in cash or by card when your order is delivered to you.'}
                    </p>
                  </div>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-furniture-taupe hover:bg-furniture-brown text-white py-3 text-lg" 
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Complete Order'}
              </Button>
            </form>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm h-fit">
            <h2 className="text-xl font-medium mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">{(item.product.price * item.quantity).toFixed(2)} DT</p>
                </div>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <p>Subtotal</p>
                <p className="font-medium">{totalPrice.toFixed(2)} DT</p>
              </div>
              <div className="flex justify-between">
                <p>Shipping</p>
                <p className="font-medium">0.00 DT</p>
              </div>
              <div className="flex justify-between">
                <p>Tax</p>
                <p className="font-medium">{(totalPrice * 0.15).toFixed(2)} DT</p>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex justify-between text-lg font-semibold">
              <p>Total</p>
              <p>{(totalPrice + totalPrice * 0.15).toFixed(2)} DT</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Checkout;
