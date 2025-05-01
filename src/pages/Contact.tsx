import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { MapPin, Phone, Mail, Clock, SeparatorHorizontal, LucideSeparatorHorizontal } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowRight } from 'lucide-react';
import { AppointmentModal } from '@/components/AppointmentModal';

const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères' }),
  email: z.string().email({ message: 'Email invalide' }),
  message: z.string().min(10, { message: 'Le message doit contenir au moins 10 caractères' })
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const { language } = useLanguage();
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      message: ''
    }
  });
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current) return;

      const location = { lat: 36.408308, lng: 10.638848 };
      
      const map = new google.maps.Map(mapRef.current, {
        center: location,
        zoom: 15,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });

      const marker = new google.maps.Marker({
        position: location,
        map: map,
        title: "Meubles Karim",
        animation: google.maps.Animation.DROP
      });

      mapInstance.current = map;
      markerRef.current = marker;
    };

    // Load Google Maps script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAR3cHRB1E9drUjG175BcyMIvFo2G9VN6g`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, []);

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Here you would normally send the form data to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Message envoyé",
        description: "Nous vous répondrons dans les plus brefs délais.",
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du message.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Contact | Meubles Karim</title>
      </Helmet>
 {/* Hero Section */}
 <section className="relative h-[40vh] overflow-hidden">
        {/* Hero Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
            alt="Elegant furniture collection" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30"></div>
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10 h-full flex flex-col justify-center text-white">
          <div className="max-w-2xl animate-fade-in">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold leading-tight mb-4">
              {language === 'fr' ? 'Contactez-Nous' : 'Contact Us'}
            </h1>
            <p className="text-lg mb-6 text-white/90 max-w-xl">
              {language === 'fr' 
                ? 'Nous sommes à votre disposition pour toute question concernant nos produits, services ou pour planifier une visite à notre showroom.' 
                : 'We are here to answer any questions you may have about our products, services, or to schedule a visit to our showroom.'}
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => window.scrollTo({ top: window.innerHeight * 0.4, behavior: 'smooth' })}
                className="bg-white text-gray-900 hover:bg-gray-200 font-medium px-6 py-2 rounded-md transition-colors duration-300 flex items-center"
              >
                {language === 'fr' ? 'Contactez-Nous' : 'Contact Us'} <ArrowRight size={16} className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      </section>
      <Separator className="my-12" />
      <div className="max-w-5xl mx-auto">
       
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <MapPin className="w-5 h-5 mt-1 text-primary" />
                <div>
                  <h3 className="font-medium">Adresse</h3>
                  <p>Route Hammamet Nord vers Nabeul, Hammamet, Tunisia, 8050</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <Phone className="w-5 h-5 mt-1 text-primary" />
                <div>
                  <h3 className="font-medium">Téléphone</h3>
                  <p>+216 72 260 360</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <Mail className="w-5 h-5 mt-1 text-primary" />
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p>contactmkarim@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <Clock className="w-5 h-5 mt-1 text-primary" />
                <div>
                  <h3 className="font-medium">Heures d'ouverture</h3>
                  <p>Lundi - Samedi: 9h00 - 18h00</p>
                  <p>Dimanche: Fermé</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-xl font-serif mb-4">Notre emplacement</h3>
              <div 
                ref={mapRef} 
                className="rounded-lg overflow-hidden h-64 bg-gray-200"
                style={{ height: '400px' }}
              />
            </div>
          </div>
          
          <div>
            <div className="bg-stone-50 p-8 rounded-lg">
              <h2 className="text-xl font-serif mb-6">Envoyez-nous un message</h2>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <Input placeholder="Votre nom" {...field} />
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="votre@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Votre message" 
                            rows={5}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
        
        <Separator className="my-16" />
        
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-serif mb-4">Visitez notre showroom</h2>
          <p className="mb-6">
            Nous vous invitons à visiter notre showroom à Hammamet pour découvrir notre collection de meubles et bénéficier des conseils de nos experts.
          </p>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => setIsAppointmentModalOpen(true)}
          >
            Prendre rendez-vous
          </Button>
        </div>
        <Separator className="my-12" />
      </div>
      <AppointmentModal 
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
      />
    </div>
  );
};

export default Contact;
