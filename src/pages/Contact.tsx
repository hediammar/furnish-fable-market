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
import { MapPin, Phone, Mail, Clock, Calendar, X, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères' }),
  email: z.string().email({ message: 'Email invalide' }),
  message: z.string().min(10, { message: 'Le message doit contenir au moins 10 caractères' })
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

interface Appointment {
  id: number;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  user_id: string;
}

const Contact = () => {
  const { user } = useAuth();
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

  // Appointment states
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  // Fetch existing appointments
  const { data: appointments = [], isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rendezvous')
        .select('appointment_date, appointment_time, status, user_id')
        .order('appointment_date', { ascending: true });

      if (error) {
        console.error('Error fetching appointments:', error);
        throw error;
      }
      return data as Appointment[];
    }
  });

  // Check if user has an appointment in the same week
  const hasAppointmentInSameWeek = (date: Date) => {
    if (!user || !appointments) return false;
    
    const selectedDate = new Date(date);
    const selectedWeekStart = new Date(selectedDate);
    selectedWeekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
    const selectedWeekEnd = new Date(selectedWeekStart);
    selectedWeekEnd.setDate(selectedWeekStart.getDate() + 6);

    return appointments.some(appointment => {
      if (appointment.user_id !== user.id || appointment.status === 'cancelled') return false;
      
      const appointmentDate = new Date(appointment.appointment_date);
      return appointmentDate >= selectedWeekStart && appointmentDate <= selectedWeekEnd;
    });
  };

  // Generate time slots (9:00 to 18:00 with 30-minute intervals)
  const timeSlots = Array.from({ length: 19 }, (_, i) => {
    const hour = 9 + Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  // Check if a time slot is available
  const isTimeSlotAvailable = (date: Date, time: string) => {
    if (!appointments || appointments.length === 0) return true;
    
    const selectedDateStr = format(date, 'yyyy-MM-dd');
    
    return !appointments.some(appointment => {
      const isSameDate = appointment.appointment_date === selectedDateStr;
      const isSameTime = appointment.appointment_time === time || appointment.appointment_time === `${time}:00`;
      const isNotCancelled = appointment.status !== 'cancelled';
      
      return isSameDate && isSameTime && isNotCancelled;
    });
  };

  // Handle appointment confirmation
  const handleAppointmentConfirmation = async () => {
    if (!selectedDate || !selectedTime || !user) return;

    // Check if user already has an appointment in the same week
    if (hasAppointmentInSameWeek(selectedDate)) {
      toast({
        title: "Rendez-vous non disponible",
        description: "Vous avez déjà un rendez-vous prévu cette semaine. Veuillez choisir une autre semaine.",
        variant: "destructive",
      });
      return;
    }

    // Double check availability before confirming
    if (!isTimeSlotAvailable(selectedDate, selectedTime)) {
      toast({
        title: "Créneau non disponible",
        description: "Ce créneau a été réservé entre-temps. Veuillez choisir un autre horaire.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('rendezvous')
        .insert([
          {
            user_id: user.id,
            appointment_date: format(selectedDate, 'yyyy-MM-dd'),
            appointment_time: selectedTime,
            status: 'pending'
          }
        ]);

      if (error) throw error;

      toast({
        title: "Rendez-vous confirmé",
        description: "Votre rendez-vous a été enregistré avec succès.",
      });

      setIsConfirmationOpen(false);
      setIsAppointmentModalOpen(false);
      setSelectedDate(undefined);
      setSelectedTime('');
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du rendez-vous.",
        variant: "destructive",
      });
    }
  };

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

      {/* Appointment Modal */}
      <Dialog open={isAppointmentModalOpen} onOpenChange={setIsAppointmentModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prendre un rendez-vous</DialogTitle>
            <DialogDescription>
              {!user ? (
                <p className="text-red-500">Veuillez vous connecter pour prendre un rendez-vous.</p>
              ) : (
                "Sélectionnez une date et une heure pour votre visite."
              )}
            </DialogDescription>
          </DialogHeader>

          {user ? (
            <div className="grid gap-4 py-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Sélectionnez une date</h3>
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today || hasAppointmentInSameWeek(date);
                  }}
                  className="rounded-md border"
                />
                {selectedDate && hasAppointmentInSameWeek(selectedDate) && (
                  <p className="text-red-500 text-sm mt-2">
                    Vous avez déjà un rendez-vous prévu cette semaine.
                  </p>
                )}
              </div>

              {selectedDate && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Sélectionnez une heure</h3>
                  {isLoadingAppointments ? (
                    <div className="flex justify-center items-center h-32">
                      <p className="text-gray-500">Chargement des créneaux disponibles...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto">
                      {timeSlots.map((time) => {
                        const isAvailable = isTimeSlotAvailable(selectedDate, time);
                        return (
                          <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "outline"}
                            onClick={() => {
                              if (isAvailable) {
                                setSelectedTime(time);
                              }
                            }}
                            disabled={!isAvailable}
                            className={cn(
                              "h-10 text-sm",
                              !isAvailable && "opacity-50 cursor-not-allowed bg-gray-100"
                            )}
                          >
                            {time}
                            {!isAvailable && (
                              <span className="ml-1 text-xs">(Occupé)</span>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="py-4 text-center">
              <Button
                variant="default"
                onClick={() => {
                  setIsAppointmentModalOpen(false);
                  // You might want to redirect to login here
                }}
              >
                Se connecter
              </Button>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAppointmentModalOpen(false)}
              className="w-full sm:w-auto"
            >
              Annuler
            </Button>
            {user && (
              <Button
                onClick={() => setIsConfirmationOpen(true)}
                disabled={!selectedDate || !selectedTime || !isTimeSlotAvailable(selectedDate, selectedTime) || hasAppointmentInSameWeek(selectedDate)}
                className="w-full sm:w-auto"
              >
                Confirmer
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer le rendez-vous</DialogTitle>
            <DialogDescription>
              Veuillez vérifier les détails de votre rendez-vous avant de confirmer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <h3 className="text-sm font-medium">Date</h3>
              <p className="text-base">{selectedDate && format(selectedDate, 'EEEE d MMMM yyyy', { locale: language === 'fr' ? fr : enUS })}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Heure</h3>
              <p className="text-base">{selectedTime}</p>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsConfirmationOpen(false)}
              className="w-full sm:w-auto"
            >
              Modifier
            </Button>
            <Button 
              onClick={handleAppointmentConfirmation}
              className="w-full sm:w-auto"
            >
              Confirmer le rendez-vous
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Contact;
