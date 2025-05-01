import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { appointmentService, Appointment } from '@/services/appointmentService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, Calendar } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';

const AppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: appointments = [], isLoading, error } = useQuery({
    queryKey: ['user', 'appointments', user?.id],
    queryFn: () => user?.id ? appointmentService.getUserAppointments() : Promise.resolve([]),
    enabled: !!user?.id,
  });

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          {language === 'fr' ? 'En attente' : 'Pending'}
        </Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          {language === 'fr' ? 'Confirmé' : 'Confirmed'}
        </Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          {language === 'fr' ? 'Annulé' : 'Cancelled'}
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'PPp', { locale: language === 'fr' ? fr : enUS });
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Invalid date';
    }
  };

  const handleViewAppointment = (appointment: Appointment) => {
    setViewingAppointment(appointment);
    setIsViewDialogOpen(true);
  };

  if (!user) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <p className="mb-4">
            {language === 'fr' ? 'Veuillez vous connecter' : 'Please sign in'}
          </p>
          <Button onClick={() => navigate('/auth')}>
            {language === 'fr' ? 'Se connecter' : 'Sign In'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <Helmet>
        <title>{language === 'fr' ? 'Mes Rendez-vous' : 'My Appointments'} | Meubles Karim</title>
      </Helmet>
      
      <h1 className="font-serif text-3xl font-medium mb-8 text-center">
        {language === 'fr' ? 'Mes Rendez-vous' : 'My Appointments'}
      </h1>
      
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'fr' ? 'Rendez-vous' : 'Appointments'}
            </CardTitle>
            <CardDescription>
              {language === 'fr' 
                ? 'Gérez vos rendez-vous pour la consultation de meubles'
                : 'Manage your furniture consultation appointments'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" role="status">
                  <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                </div>
                <p className="mt-4 text-muted-foreground">
                  {language === 'fr' ? 'Chargement...' : 'Loading...'}
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <p>
                  {language === 'fr' 
                    ? 'Erreur lors du chargement des rendez-vous. Veuillez réessayer.'
                    : 'Error loading appointments. Please try again.'}
                </p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {language === 'fr' ? 'Aucun rendez-vous' : 'No appointments'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {language === 'fr'
                    ? "Vous n'avez pas encore pris de rendez-vous."
                    : "You haven't scheduled any appointments yet."}
                </p>
                <Button onClick={() => navigate('/appointments/new')}>
                  {language === 'fr' ? 'Prendre un rendez-vous' : 'Schedule an Appointment'}
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{language === 'fr' ? 'Date' : 'Date'}</TableHead>
                      <TableHead>{language === 'fr' ? 'Heure' : 'Time'}</TableHead>
                      <TableHead>{language === 'fr' ? 'Statut' : 'Status'}</TableHead>
                      <TableHead className="text-right">{language === 'fr' ? 'Actions' : 'Actions'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(appointment.appointment_date), 'PP', { locale: language === 'fr' ? fr : enUS })}
                        </TableCell>
                        <TableCell>{appointment.appointment_time}</TableCell>
                        <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewAppointment(appointment)}
                          >
                            <Eye size={16} className="mr-2" />
                            {language === 'fr' ? 'Voir' : 'View'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {language === 'fr' ? 'Détails du rendez-vous' : 'Appointment Details'}
            </DialogTitle>
          </DialogHeader>
          
          {viewingAppointment && (
            <div className="mt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      {language === 'fr' ? 'ID du rendez-vous' : 'Appointment ID'}
                    </h3>
                    <p className="font-mono">#{viewingAppointment.id}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      {language === 'fr' ? 'Statut' : 'Status'}
                    </h3>
                    <div>{getStatusBadge(viewingAppointment.status)}</div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      {language === 'fr' ? 'Créé le' : 'Created'}
                    </h3>
                    <p>{formatDate(viewingAppointment.created_at)}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      {language === 'fr' ? 'Date du rendez-vous' : 'Appointment Date'}
                    </h3>
                    <p>
                      {format(new Date(viewingAppointment.appointment_date), 'PP', { locale: language === 'fr' ? fr : enUS })}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      {language === 'fr' ? 'Heure du rendez-vous' : 'Appointment Time'}
                    </h3>
                    <p>{viewingAppointment.appointment_time}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentsPage; 