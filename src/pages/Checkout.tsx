
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

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
  const { language } = useLanguage();
  
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

  const createEstimate = async (formData: CheckoutFormValues) => {
    try {
      const { data, error } = await supabase.from('estimates').insert({
        user_id: user?.id,
        total_amount: 0, // Price on request, so we don't include actual totals
        status: 'pending',
        shipping_address: `${formData.address}, ${formData.city}, ${formData.zipCode}, ${formData.country}`,
        items: cartItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          name: item.product.name
        })),
        contact_email: formData.email,
        contact_phone: formData.phone
      }).select();
      
      if (error) {
        console.error('Error creating estimate:', error);
        throw error;
      }
      
      await sendEstimateEmail(formData.email, data[0]);
      
      return data[0];
    } catch (error) {
      console.error('Error creating estimate:', error);
      throw error;
    }
  };

  const sendEstimateEmail = async (email: string, estimateData: any) => {
    try {
      // Call edge function to send email
      const { error } = await supabase.functions.invoke('send-estimate', {
        body: { 
          email,
          estimate: estimateData,
          items: cartItems,
          language
        }
      });
      
      if (error) {
        console.error('Error sending estimate email:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error sending estimate email:', error);
      throw error;
    }
  };

  const onSubmit = async (data: CheckoutFormValues) => {
    setIsProcessing(true);
    
    try {
      // Create estimate in database
      await createEstimate(data);
      
      // Clear cart
      clearCart();
      
      // Redirect to success page
      navigate('/checkout/success');
      
      toast({
        title: language === 'fr' ? "Estimation envoyée" : "Estimate sent",
        description: language === 'fr' 
          ? "Votre demande d'estimation a été envoyée avec succès! Vérifiez votre email." 
          : "Your estimate request has been successfully sent! Check your email.",
      });
    } catch (error) {
      console.error('Error processing estimate:', error);
      setIsProcessing(false);
      toast({
        title: language === 'fr' ? "Erreur" : "Error",
        description: language === 'fr'
          ? "Un problème est survenu lors du traitement de votre demande. Veuillez réessayer."
          : "There was a problem processing your request. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <Helmet>
        <title>{language === 'fr' ? 'Demande d\'estimation | Meubles Karim' : 'Request Estimate | Meubles Karim'}</title>
        <meta name="description" content={language === 'fr' ? 'Demandez une estimation pour vos meubles' : 'Request an estimate for your furniture'} />
      </Helmet>
      
      <h1 className="font-serif text-3xl font-medium mb-8">
        {language === 'fr' ? 'Demande d\'estimation' : 'Request Estimate'}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <Card>
          <CardHeader>
            <CardTitle>{language === 'fr' ? 'Informations de livraison' : 'Shipping Information'}</CardTitle>
            <CardDescription>
              {language === 'fr' ? 'Entrez vos coordonnées pour recevoir une estimation' : 'Enter your details to receive an estimate'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'fr' ? 'Email' : 'Email'}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'fr' ? 'Numéro de téléphone' : 'Phone Number'}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'fr' ? 'Adresse' : 'Address'}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'fr' ? 'Ville' : 'City'}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'fr' ? 'Code postal' : 'Zip Code'}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'fr' ? 'Pays' : 'Country'}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" disabled={isProcessing} className="w-full">
                  {isProcessing 
                    ? (language === 'fr' ? 'Traitement en cours...' : 'Processing...') 
                    : (language === 'fr' ? 'Demander une estimation' : 'Request Estimate')}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>{language === 'fr' ? 'Résumé de la commande' : 'Order Summary'}</CardTitle>
            <CardDescription>
              {language === 'fr' ? 'Vérifiez les détails de votre commande' : 'Review your order details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {cartItems.map((item) => (
                <li key={item.product.id} className="flex justify-between">
                  <span>{item.product.name} x {item.quantity}</span>
                  <span>{language === 'fr' ? 'Prix sur demande' : 'Price on request'}</span>
                </li>
              ))}
            </ul>
            <Separator className="my-4" />
            <div className="flex justify-between font-medium">
              <span>{language === 'fr' ? 'Total' : 'Total'}</span>
              <span>{language === 'fr' ? 'Prix sur demande' : 'Price on request'}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" onClick={() => navigate('/cart')}>
              {language === 'fr' ? 'Retour au panier' : 'Back to Cart'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Checkout;
