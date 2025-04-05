import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/utils/currencyUtils';
import { supabase } from '@/integrations/supabase/client';

const checkoutFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(8, { message: "Phone number must be at least 8 digits" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  city: z.string().min(2, { message: "City must be at least 2 characters" }),
  zipCode: z.string().min(4, { message: "Zip code must be at least 4 characters" }),
  country: z.string().min(2, { message: "Country must be at least 2 characters" }),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

const Checkout: React.FC = () => {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      email: user?.email || '',
      phone: '',
      address: '',
      city: '',
      zipCode: '',
      country: '',
    },
  });

const createOrder = async (orderData: any) => {
  try {
    const { data, error } = await supabase.from('orders').insert({
      user_id: user?.id,
      total_amount: cartTotal,
      status: 'pending',
      shipping_address: `${address}, ${city}, ${zipCode}, ${country}`,
      items: cartItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      })),
      // Remove payment_method field since it doesn't exist in the schema
      // payment_method: paymentMethod,
      contact_email: email,
      contact_phone: phone
    }).select();
    
    if (error) {
      console.error('Error creating order:', error);
      throw error;
    }
    
    return data[0];
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

  const onSubmit = async (data: CheckoutFormValues) => {
    setIsProcessing(true);
    
    try {
      // Create order in database
      const orderData = await createOrder({
        ...data,
        // Don't include payment_method
        cartItems,
        cartTotal
      });
      
      // Clear cart
      clearCart();
      
      // Redirect to success page
      navigate('/checkout/success');
      
      toast({
        title: "Order placed",
        description: "Your order has been successfully placed!",
      });
    } catch (error) {
      console.error('Error processing order:', error);
      setIsProcessing(false);
      toast({
        title: "Error",
        description: "There was a problem processing your order. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <Helmet>
        <title>Checkout | Meubles Karim</title>
        <meta name="description" content="Secure checkout page for Meubles Karim" />
      </Helmet>
      
      <h1 className="font-serif text-3xl font-medium mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping Information</CardTitle>
            <CardDescription>Enter your shipping details</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...form.register("email")} />
                  {form.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" {...form.register("phone")} />
                  {form.formState.errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.phone.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" type="text" {...form.register("address")} />
                  {form.formState.errors.address && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.address.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" type="text" {...form.register("city")} />
                  {form.formState.errors.city && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.city.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input id="zipCode" type="text" {...form.register("zipCode")} />
                  {form.formState.errors.zipCode && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.zipCode.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" type="text" {...form.register("country")} />
                  {form.formState.errors.country && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.country.message}</p>
                  )}
                </div>
                
                <Button type="submit" disabled={isProcessing} className="w-full">
                  {isProcessing ? 'Processing...' : 'Place Order'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>Review your order details</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {cartItems.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span>{item.name} x {item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <Separator className="my-4" />
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" onClick={() => navigate('/cart')}>
              Back to Cart
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Checkout;
