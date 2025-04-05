
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, User, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const signupSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  full_name: z.string().min(2, { message: 'Full name is required' }),
  phone_number: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

type SignupValues = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onSuccess?: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      full_name: '',
      phone_number: '',
      city: '',
      country: '',
    },
  });

  const onSubmit = async (values: SignupValues) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.full_name,
            phone_number: values.phone_number || '',
            city: values.city || '',
            country: values.country || '',
          },
        },
      });

      if (error) {
        toast({
          title: language === 'fr' ? 'Erreur d\'inscription' : 'Signup Error',
          description: error.message,
          variant: 'destructive',
        });
        console.error('Signup error:', error);
      } else {
        toast({
          title: language === 'fr' ? 'Inscription réussie' : 'Signup Successful',
          description: language === 'fr' 
            ? 'Votre compte a été créé avec succès' 
            : 'Your account has been created successfully',
        });
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Unexpected error during signup:', error);
      toast({
        title: language === 'fr' ? 'Erreur inattendue' : 'Unexpected Error',
        description: language === 'fr' 
          ? 'Une erreur inattendue s\'est produite. Veuillez réessayer.'
          : 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-serif font-medium">
          {language === 'fr' ? 'Créer un compte' : 'Create an Account'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'fr' 
            ? 'Entrez vos informations pour créer un compte'
            : 'Enter your information to create an account'}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{language === 'fr' ? 'Nom complet' : 'Full Name'}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      className="luxury-input pl-10"
                      placeholder={language === 'fr' ? 'Votre nom complet' : 'Your full name'}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{language === 'fr' ? 'Email' : 'Email'}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      type="email"
                      className="luxury-input pl-10"
                      placeholder={language === 'fr' ? 'Votre adresse email' : 'Your email address'}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{language === 'fr' ? 'Mot de passe' : 'Password'}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      type="password"
                      className="luxury-input pl-10"
                      placeholder={language === 'fr' ? 'Créez un mot de passe' : 'Create a password'}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{language === 'fr' ? 'Numéro de téléphone' : 'Phone Number'}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      className="luxury-input pl-10"
                      placeholder={language === 'fr' ? 'Votre numéro de téléphone' : 'Your phone number'}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{language === 'fr' ? 'Ville' : 'City'}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        className="luxury-input pl-10"
                        placeholder={language === 'fr' ? 'Votre ville' : 'Your city'}
                      />
                    </div>
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
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        className="luxury-input pl-10"
                        placeholder={language === 'fr' ? 'Votre pays' : 'Your country'}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full py-6 mt-4 bg-furniture-taupe hover:bg-furniture-brown text-white"
            disabled={isLoading}
          >
            {isLoading
              ? language === 'fr' ? 'Création en cours...' : 'Creating account...'
              : language === 'fr' ? 'Créer un compte' : 'Create account'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SignupForm;
