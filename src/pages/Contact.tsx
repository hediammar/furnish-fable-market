import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MapPin, Mail, Phone, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormValues = z.infer<typeof formSchema>;

const Contact: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });
  
  const onSubmit = (data: FormValues) => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Contact form data:', data);
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you as soon as possible.",
      });
      form.reset();
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | Meubles Karim</title>
        <meta name="description" content="Get in touch with Meubles Karim for inquiries, support, or to schedule a showroom visit." />
      </Helmet>
      
      <main>
        {/* Hero Section */}
        <section className="bg-muted py-16">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-serif text-4xl md:text-5xl font-medium mb-6">Contactez-Nous</h1>
              <p className="text-lg text-muted-foreground">
                Vous avez des questions ou besoin d'assistance? Nous sommes là pour vous aider.
              </p>
            </div>
          </div>
        </section>
        
        {/* Contact Information and Form */}
        <section className="py-16">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div>
                <h2 className="font-serif text-3xl font-medium mb-6">Contactez-Nous</h2>
                <p className="text-muted-foreground mb-8">
                  Que vous ayez une question sur nos meubles, besoin d'aide avec une commande, ou que vous souhaitiez planifier une visite de notre showroom, notre équipe est prête à vous assister.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-muted p-3 rounded-full mr-5">
                      <MapPin className="text-furniture-brown" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Notre Adresse</h3>
                      <p className="text-muted-foreground">
                        Route Hammamet Nord vers Nabeul<br />
                        Hammamet, Tunisia, 8050
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-muted p-3 rounded-full mr-5">
                      <Mail className="text-furniture-brown" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Email</h3>
                      <p className="text-muted-foreground">
                        <a href="mailto:contactmkarim@gmail.com" className="hover:text-furniture-brown">
                          contactmkarim@gmail.com
                        </a>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-muted p-3 rounded-full mr-5">
                      <Phone className="text-furniture-brown" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Téléphone</h3>
                      <p className="text-muted-foreground">
                        <a href="tel:+21672260360" className="hover:text-furniture-brown">
                          +216 72 260 360
                        </a><br />
                        Lundi au Vendredi: 9h - 18h<br />
                        Samedi: 10h - 16h
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-muted p-3 rounded-full mr-5">
                      <Clock className="text-furniture-brown" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Heures d'Ouverture du Showroom</h3>
                      <p className="text-muted-foreground">
                        Lundi au Vendredi: 10h - 19h<br />
                        Samedi: 10h - 17h<br />
                        Dimanche: 11h - 16h
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Contact Form */}
              <div>
                <div className="bg-muted p-8 rounded-lg">
                  <h2 className="font-serif text-2xl font-medium mb-6">Envoyez-Nous un Message</h2>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your name" {...field} />
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
                                <Input placeholder="Your email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                              <Input placeholder="Message subject" {...field} />
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
                                placeholder="How can we help you?" 
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
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Map Section */}
        <section className="py-16 bg-muted">
          <div className="container-custom">
            <h2 className="font-serif text-3xl font-medium mb-8 text-center">Visitez Notre Showroom</h2>
            
            <div className="rounded-lg overflow-hidden h-[400px] shadow-lg">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3214.0433842973813!2d10.6079403!3d36.3978297!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13029eda2a6c5187%3A0xd2d7a288e8b3da39!2sRoute%20Hammamet%20Nord%20vers%20Nabeul%2C%20Hammamet%2C%20Tunisia!5e0!3m2!1sen!2s!4v1617961236078!5m2!1sen!2s" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy"
                title="Meubles Karim Showroom Location"
              ></iframe>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Contact;
