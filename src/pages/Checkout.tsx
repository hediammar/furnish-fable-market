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
import { ShoppingBag, Truck, CheckCircle, Loader2 } from 'lucide-react';
import { User } from '@/types/user';
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
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();
  
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      email: user?.email || '',
      phone: profile?.phone_number || '',
      address: profile?.address || '',
      city: profile?.city || '',
      zipCode: profile?.zip_code || '',
      country: profile?.country || '',
    },
  });

  const createEstimate = async (formData: CheckoutFormValues) => {
    try {
      const totalAmount = cartItems.reduce(
        (total, item) => total + (item.product.price * item.quantity),
        0
      );
      
      const { data, error } = await (supabase as any).from('estimates').insert({
        user_id: user?.id,
        total_amount: totalAmount,
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
      
      try {
        await sendEstimateEmail(formData.email, data[0]);
      } catch (emailError) {
        console.error('Error sending estimate email, but estimate was created:', emailError);
        // In development, show a message about CORS issues
        if (window.location.hostname === 'localhost') {
          console.info('Note: Email sending may fail in development due to CORS restrictions. The estimate has been saved successfully.');
        }
      }
      
      return data[0];
    } catch (error) {
      console.error('Error creating estimate:', error);
      throw error;
    }
  };

  const sendEstimateEmail = async (email: string, estimateData: any) => {
    try {
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
      await createEstimate(data);
      
      clearCart();
      
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
      
      <div className="max-w-6xl mx-auto">
        <h1 className="font-serif text-3xl font-medium mb-2">
          {language === 'fr' ? 'Demande d\'estimation' : 'Request Estimate'}
        </h1>
        <p className="text-muted-foreground mb-8">
          {language === 'fr' 
            ? 'Remplissez le formulaire ci-dessous pour recevoir une estimation personnalisée.'
            : 'Fill out the form below to receive a personalized estimate.'}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {/* Steps */}
            <div className="hidden md:flex items-center justify-between mb-8">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-[#22c55e] text-white flex items-center justify-center">
                  <ShoppingBag size={18} />
                </div>
                <span className="text-sm mt-2">{language === 'fr' ? 'Panier' : 'Cart'}</span>
              </div>
              <div className="h-0.5 bg-[#22c55e] flex-1 mx-4"></div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-white text-gray-500 flex items-center justify-center">
                  <Truck size={18} />
                </div>
                <span className="text-sm mt-2 font-medium">{language === 'fr' ? 'Informations' : 'Information'}</span>
              </div>
              <div className="h-0.5 bg-gray-500 flex-1 mx-4"></div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
                  <CheckCircle size={18} />
                </div>
                <span className="text-sm mt-2 text-gray-500">{language === 'fr' ? 'Confirmation' : 'Confirmation'}</span>
              </div>
            </div>
            
            <Card className="border-furniture-cream shadow-md">
              <CardHeader className="bg-furniture-beige bg-opacity-30 border-b">
                <CardTitle>{language === 'fr' ? 'Informations d\'estimation' : 'Estimation Information'}</CardTitle>
                <CardDescription>
                  {language === 'fr' ? 'Entrez vos coordonnées pour recevoir une estimation' : 'Enter your details to receive an estimate'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{language === 'fr' ? 'Email' : 'Email'}</FormLabel>
                            <FormControl>
                              <Input {...field} className="luxury-input" />
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
                              <Input {...field} className="luxury-input" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{language === 'fr' ? 'Adresse' : 'Address'}</FormLabel>
                          <FormControl>
                            <Input {...field} className="luxury-input" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{language === 'fr' ? 'Ville' : 'City'}</FormLabel>
                            <FormControl>
                              <Input {...field} className="luxury-input" />
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
                              <Input {...field} className="luxury-input" />
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
                              <Input {...field} className="luxury-input" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        disabled={isProcessing} 
                        className="w-full py-6 bg-[#d2ac35] hover:bg-black text-white font-semibold rounded-md transition-colors"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {language === 'fr' ? 'Traitement en cours...' : 'Processing...'}
                          </>
                        ) : (
                          language === 'fr' ? 'Demander une estimation' : 'Request Estimate'
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card className="border-furniture-cream shadow-md">
              <CardHeader className="bg-furniture-beige bg-opacity-30 border-b">
                <CardTitle>{language === 'fr' ? 'Résumé de l\'estimation' : 'Estimation Summary'}</CardTitle>
                <CardDescription>
                  {language === 'fr' ? 'Vérifiez les détails de votre estimation' : 'Review your estimation details'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {cartItems.map((item) => (
                    <li key={item.product.id} className="flex justify-between py-2">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 mr-3 border">
                          {item.product.images && item.product.images.length > 0 && (
                            <img 
                              src={item.product.images[0]} 
                              alt={item.product.name} 
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{item.product.name}</h4>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium">
                        {language === 'fr' ? 'Prix sur demande' : 'Price on request'}
                      </span>
                    </li>
                  ))}
                </ul>
                <Separator className="my-4" />
                <div className="flex justify-between font-medium">
                  <span>{language === 'fr' ? 'Total' : 'Total'}</span>
                  <span>{language === 'fr' ? 'Prix sur demande' : 'Price on request'}</span>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 flex flex-col space-y-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/cart')}
                  className="w-full"
                >
                  {language === 'fr' ? 'Retour au panier' : 'Back to Cart'}
                </Button>
                
                <div className="text-xs text-muted-foreground text-center px-2">
                  {language === 'fr' 
                    ? 'En demandant une estimation, vous recevrez un devis personnalisé par email.'
                    : 'By requesting an estimate, you will receive a personalized quote by email.'}
                </div>
              </CardFooter>
            </Card>
            
            <div className="bg-furniture-cream bg-opacity-30 rounded-lg p-4 text-sm">
              <h4 className="font-medium mb-2">
                {language === 'fr' ? 'Comment ça marche?' : 'How it works?'}
              </h4>
              <ol className="list-decimal pl-4 space-y-2 text-muted-foreground">
                <li>
                  {language === 'fr' 
                    ? 'Soumettez votre demande d\'estimation'
                    : 'Submit your estimate request'}
                </li>
                <li>
                  {language === 'fr' 
                    ? 'Recevez un devis personnalisé par email'
                    : 'Receive a personalized quote by email'}
                </li>
                <li>
                  {language === 'fr' 
                    ? 'Un conseiller vous contactera pour finaliser votre commande'
                    : 'A consultant will contact you to finalize your order'}
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
