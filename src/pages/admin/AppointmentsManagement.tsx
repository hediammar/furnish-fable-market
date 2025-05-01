import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X, AlertCircle, Clock, Trash2, Eye, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Appointment {
  id: number;
  user_id: string;
  user_email: string;
  user_name: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

const AppointmentsManagement: React.FC = () => {
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { language } = useLanguage();

  const { data: appointments = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'appointments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rendezvous')
        .select(`
          *,
          profiles:user_id (
            email,
            full_name
          )
        `)
        .order('appointment_date', { ascending: true });

      if (error) throw error;

      return data.map(appointment => ({
        ...appointment,
        user_email: appointment.profiles?.email || 'N/A',
        user_name: appointment.profiles?.full_name || 'N/A'
      }));
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: Appointment['status'] }) => {
      const { data, error } = await supabase
        .from('rendezvous')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'appointments'] });
      setIsViewDialogOpen(false);
      toast({
        title: 'Status updated',
        description: 'Appointment status has been updated successfully.',
      });
    },
    onError: (error) => {
      console.error('Error updating appointment status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update the appointment status.',
        variant: 'destructive',
      });
    },
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('rendezvous')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'appointments'] });
      toast({
        title: 'Appointment deleted',
        description: 'The appointment has been successfully deleted.',
      });
    },
    onError: (error) => {
      console.error('Error deleting appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the appointment.',
        variant: 'destructive',
      });
    },
  });

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Confirmed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { 
        addSuffix: true,
        locale: language === 'fr' ? fr : enUS
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Invalid date';
    }
  };

  const handleViewAppointment = (appointment: Appointment) => {
    setViewingAppointment(appointment);
    setIsViewDialogOpen(true);
  };

  const handleUpdateStatus = (id: number, status: Appointment['status']) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleDeleteAppointment = (id: number) => {
    deleteAppointmentMutation.mutate(id);
  };

  const appointmentsArray = Array.isArray(appointments) ? appointments : [];
  
  const pendingAppointments = appointmentsArray.filter(a => a.status === 'pending');
  const confirmedAppointments = appointmentsArray.filter(a => a.status === 'confirmed');
  const cancelledAppointments = appointmentsArray.filter(a => a.status === 'cancelled');

  const renderAppointmentTable = (filteredAppointments: Appointment[]) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAppointments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                No appointments found
              </TableCell>
            </TableRow>
          ) : (
            filteredAppointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell className="font-mono text-xs">#{appointment.id}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{appointment.user_name}</div>
                    <div className="text-sm text-muted-foreground">{appointment.user_email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div>{new Date(appointment.appointment_date).toLocaleDateString()}</div>
                    <div className="text-sm text-muted-foreground">{appointment.appointment_time}</div>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleViewAppointment(appointment)}>
                      <Eye size={16} />
                    </Button>
                    
                    {appointment.status === 'pending' && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleUpdateStatus(appointment.id, 'confirmed')}
                        >
                          <Check size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleUpdateStatus(appointment.id, 'cancelled')}
                        >
                          <X size={16} />
                        </Button>
                      </>
                    )}
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this appointment. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => handleDeleteAppointment(appointment.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div>
      <Helmet>
        <title>Appointments Management | Admin Dashboard</title>
      </Helmet>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-serif font-medium">Appointments Management</h1>
        <div className="flex space-x-2">
          <Button variant="outline" className="relative" onClick={() => refetch()}>
            Refresh
          </Button>
          <Button variant="outline" className="relative">
            Pending
            {pendingAppointments.length > 0 && (
              <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {pendingAppointments.length}
              </span>
            )}
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" role="status">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
              </div>
              <p className="mt-4 text-muted-foreground">Loading appointments...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <AlertCircle className="mx-auto h-8 w-8" />
              <p className="mt-4">Error loading appointments. Please try again.</p>
            </div>
          ) : appointmentsArray.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No appointments found. Waiting for customers to book appointments.</p>
            </div>
          ) : (
            <Tabs defaultValue="pending">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="pending" className="relative">
                  Pending
                  {pendingAppointments.length > 0 && (
                    <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                      {pendingAppointments.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="confirmed">
                  Confirmed
                </TabsTrigger>
                <TabsTrigger value="cancelled">
                  Cancelled
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="pending" className="mt-0">
                {renderAppointmentTable(pendingAppointments)}
              </TabsContent>
              
              <TabsContent value="confirmed" className="mt-0">
                {renderAppointmentTable(confirmedAppointments)}
              </TabsContent>
              
              <TabsContent value="cancelled" className="mt-0">
                {renderAppointmentTable(cancelledAppointments)}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              Review the appointment details.
            </DialogDescription>
          </DialogHeader>
          
          {viewingAppointment && (
            <div className="mt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Appointment ID</h3>
                    <p className="font-mono">#{viewingAppointment.id}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                    <div>{getStatusBadge(viewingAppointment.status)}</div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Created</h3>
                    <p>{formatDate(viewingAppointment.created_at)}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Customer Name</h3>
                    <p>{viewingAppointment.user_name}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Customer Email</h3>
                    <p>{viewingAppointment.user_email}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Appointment Date & Time</h3>
                    <p>
                      {new Date(viewingAppointment.appointment_date).toLocaleDateString()} at {viewingAppointment.appointment_time}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between pt-4 border-t">
                <div className="space-x-2">
                  {viewingAppointment.status === 'pending' && (
                    <>
                      <Button 
                        variant="outline" 
                        className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
                        onClick={() => {
                          handleUpdateStatus(viewingAppointment.id, 'cancelled');
                        }}
                      >
                        <X size={16} className="mr-1" /> Cancel
                      </Button>
                      <Button 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => {
                          handleUpdateStatus(viewingAppointment.id, 'confirmed');
                        }}
                      >
                        <Check size={16} className="mr-1" /> Confirm
                      </Button>
                    </>
                  )}
                </div>
                
                <Button 
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentsManagement; 