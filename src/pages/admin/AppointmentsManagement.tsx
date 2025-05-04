import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X, AlertCircle, Clock, Trash2, Eye, CheckCircle, Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDistanceToNow, format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns';
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
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { appointmentService } from '@/services/appointmentService';
import { cn } from '@/lib/utils';

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

interface AppointmentSlot {
  time: string;
  isAvailable: boolean;
}

const AppointmentsManagement: React.FC = () => {
  // 1. Context hooks
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { language } = useLanguage();

  // 2. State hooks
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showCreateAppointment, setShowCreateAppointment] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [users, setUsers] = useState<{ id: string; email: string; full_name: string }[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<AppointmentSlot[]>([]);

  // 3. Query hooks
  const { data: appointments = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'appointments'],
    queryFn: async () => {
      console.log('Fetching appointments...');
      try {
        const { data, error } = await supabase
          .from('rendezvous')
          .select(`
            id,
            user_id,
            appointment_date,
            appointment_time,
            status,
            created_at,
            updated_at,
            profiles (
              email,
              full_name
            )
          `)
          .order('appointment_date', { ascending: true });

        if (error) {
          console.error('Error fetching appointments:', error);
          throw error;
        }

        if (!data) {
          console.log('No data returned from Supabase');
          return [];
        }

        console.log('Raw appointments data:', data);

        const formattedData = data.map(appointment => {
          const formattedAppointment = {
            id: appointment.id,
            user_id: appointment.user_id,
            appointment_date: appointment.appointment_date,
            appointment_time: appointment.appointment_time,
            status: appointment.status,
            created_at: appointment.created_at,
            updated_at: appointment.updated_at,
            user_email: appointment.profiles?.email || 'N/A',
            user_name: appointment.profiles?.full_name || 'N/A'
          };
          console.log('Formatted appointment:', formattedAppointment);
          return formattedAppointment;
        });

        console.log('Total appointments fetched:', formattedData.length);
        return formattedData;
      } catch (error) {
        console.error('Error in appointments query:', error);
        return [];
      }
    },
  });

  // 4. Mutation hooks
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

  const createAppointmentMutation = useMutation({
    mutationFn: async ({ date, time, userId }: { date: string; time: string; userId: string }) => {
      const { data, error } = await supabase
        .from('rendezvous')
        .insert([
          {
            user_id: userId,
            appointment_date: date,
            appointment_time: time,
            status: 'confirmed'
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'appointments'] });
      setShowCreateAppointment(false);
      toast({
        title: 'Success',
        description: 'Appointment created successfully.',
      });
    },
    onError: (error) => {
      console.error('Error creating appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to create the appointment.',
        variant: 'destructive',
      });
    },
  });

  // 5. Callback hooks
  const handleViewAppointment = useCallback((appointment: Appointment) => {
    setViewingAppointment(appointment);
    setIsViewDialogOpen(true);
  }, []);

  const handleUpdateStatus = useCallback((id: number, status: Appointment['status']) => {
    updateStatusMutation.mutate({ id, status });
  }, [updateStatusMutation]);

  const handleDeleteAppointment = useCallback((id: number) => {
    deleteAppointmentMutation.mutate(id);
  }, [deleteAppointmentMutation]);

  const handleCreateAppointment = useCallback(() => {
    if (!selectedDate || !selectedTime || !selectedUser) return;

    createAppointmentMutation.mutate({
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime,
      userId: selectedUser
    });
  }, [selectedDate, selectedTime, selectedUser, createAppointmentMutation]);

  const previousWeek = useCallback(() => {
    setCurrentDate(prev => addDays(prev, -7));
  }, []);

  const nextWeek = useCallback(() => {
    setCurrentDate(prev => addDays(prev, 7));
  }, []);

  // 6. Effect hooks
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('full_name');

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      setUsers(data || []);
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedDate && showCreateAppointment) {
      const fetchSlots = async () => {
        try {
          const slots = await appointmentService.getAvailableSlots(
            format(selectedDate, 'yyyy-MM-dd')
          );
          setAvailableSlots(slots);
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Unable to load available time slots',
            variant: 'destructive',
          });
        }
      };
      fetchSlots();
    }
  }, [selectedDate, showCreateAppointment, toast]);

  // 7. Derived values
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startOfWeek(currentDate), i);
    return {
      date,
      dayName: format(date, 'EEE', { locale: language === 'fr' ? fr : enUS }),
      dayNumber: format(date, 'd')
    };
  });

  const timeSlots = Array.from({ length: 20 }, (_, i) => {
    const hour = 9 + Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  // 8. Error and loading states
  if (error) {
    console.error('Appointments query error:', error);
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="text-red-500">
          Error loading appointments: {error.message}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="text-gray-500">
          Loading appointments...
        </div>
      </div>
    );
  }

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

  const appointmentsArray = Array.isArray(appointments) ? appointments : [];
  
  const pendingAppointments = appointmentsArray.filter(a => a.status === 'pending');
  const confirmedAppointments = appointmentsArray.filter(a => a.status === 'confirmed');
  const cancelledAppointments = appointmentsArray.filter(a => a.status === 'cancelled');

  const getAppointmentsForDateAndTime = (date: Date, time: string) => {
    const appointmentsForSlot = appointmentsArray.filter(appointment => {
      // Convert both dates to YYYY-MM-DD format for comparison
      const appointmentDateStr = appointment.appointment_date;
      const currentDateStr = format(date, 'yyyy-MM-dd');
      
      // Compare dates and times
      const isSameDate = appointmentDateStr === currentDateStr;
      const isSameTime = appointment.appointment_time === time || appointment.appointment_time === `${time}:00`;
      const isNotCancelled = appointment.status !== 'cancelled';
      
      return isSameDate && isSameTime && isNotCancelled;
    });
    
    return appointmentsForSlot;
  };

  const getAppointmentStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'border-yellow-500 bg-yellow-50';
      case 'confirmed':
        return 'border-green-500 bg-green-50';
      case 'cancelled':
        return 'border-red-500 bg-red-50';
      default:
        return 'border-blue-500 bg-blue-50';
    }
  };

  const renderAppointmentTable = (filteredAppointments: Appointment[]) => (
    <div className="rounded-md border border-gray-200">
      <Table>
        <TableHeader>
          <TableRow className="border-b">
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
              <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                No appointments found
              </TableCell>
            </TableRow>
          ) : (
            filteredAppointments.map(appointment => (
              <TableRow key={appointment.id} className="border-b">
                <TableCell className="font-mono text-xs">#{appointment.id}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{appointment.user_name}</div>
                    <div className="text-sm text-gray-500">{appointment.user_email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div>{new Date(appointment.appointment_date).toLocaleDateString()}</div>
                    <div className="text-sm text-gray-500">{appointment.appointment_time}</div>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                <TableCell>
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleViewAppointment(appointment)}>
                      <Eye size={16} className="text-gray-500" />
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
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  // Update the create appointment dialog content
  const renderCreateAppointmentDialog = () => (
    <Dialog open={showCreateAppointment} onOpenChange={setShowCreateAppointment}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <div className="flex flex-col md:flex-row">
          {/* Calendar Section */}
          <div className="w-full md:w-1/2 p-6 border-r">
            <DialogHeader className="mb-6">
              <DialogTitle>Select Date</DialogTitle>
            </DialogHeader>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
          </div>

          {/* Time Slots and User Selection Section */}
          <div className="w-full md:w-1/2 p-6">
            <DialogHeader className="mb-6">
              <DialogTitle>Select Time & User</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* User Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select User</label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time Slots */}
              {selectedDate ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot.time}
                        variant={selectedTime === slot.time ? 'default' : 'outline'}
                        disabled={!slot.isAvailable}
                        onClick={() => setSelectedTime(slot.time)}
                        className={cn(
                          "h-12 rounded-lg transition-all duration-200",
                          !slot.isAvailable && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {slot.time}
                      </Button>
                    ))}
                  </div>

                  <div className="pt-4 border-t">
                    <Button
                      onClick={handleCreateAppointment}
                      disabled={!selectedDate || !selectedTime || !selectedUser || createAppointmentMutation.isPending}
                      className="w-full h-12"
                    >
                      {createAppointmentMutation.isPending ? 'Creating...' : 'Create Appointment'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Please select a date to see available time slots
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const renderCalendarView = () => (
    <div className="relative">
      {/* Time indicators */}
      <div className="absolute left-0 top-0 w-16 h-full flex flex-col justify-between text-right pr-4">
        {timeSlots.map(time => (
          <div key={time} className="h-[60px] -mt-3 text-sm text-gray-500">
            {time}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="ml-16 grid grid-cols-7 gap-[1px] bg-gray-200">
        {weekDays.map((day, dayIndex) => (
          <div key={dayIndex} className="bg-white">
            {timeSlots.map((time, timeIndex) => {
              const appointmentsForSlot = getAppointmentsForDateAndTime(day.date, time);
              
              return (
                <div
                  key={`${dayIndex}-${timeIndex}`}
                  className={cn(
                    "h-[60px] p-1 border-b border-gray-100",
                    appointmentsForSlot.length > 0 && "bg-gray-50"
                  )}
                >
                  {appointmentsForSlot.map(appointment => (
                    <div
                      key={appointment.id}
                      className={cn(
                        "border-l-2 p-2 rounded-r text-sm cursor-pointer transition-colors",
                        getAppointmentStatusColor(appointment.status)
                      )}
                      onClick={() => handleViewAppointment(appointment)}
                    >
                      <div className="font-medium truncate">{appointment.user_name}</div>
                      <div className="text-xs text-gray-500 truncate flex items-center justify-between">
                        <span>{appointment.appointment_time}</span>
                        {getStatusBadge(appointment.status)}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-6">
      <Helmet>
        <title>Appointments Management | Admin Dashboard</title>
      </Helmet>

      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-medium text-gray-900">Appoinements Calendar</h1>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="bg-blue-50 text-blue-700">Week</Button>
            <Button variant="ghost" size="sm" className="text-gray-600">Month</Button>
            <Button variant="ghost" size="sm" className="text-gray-600">Year</Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <select 
              className="bg-white border border-gray-200 rounded-md px-3 py-2"
              value={format(currentDate, 'MMMM')}
              onChange={(e) => {
                const newDate = new Date(currentDate);
                newDate.setMonth(new Date(Date.parse(e.target.value + " 1, 2024")).getMonth());
                setCurrentDate(newDate);
              }}
            >
              {Array.from({ length: 12 }, (_, i) => new Date(2024, i, 1)).map(date => (
                <option key={format(date, 'MMMM')} value={format(date, 'MMMM')}>
                  {format(date, 'MMMM')}
                </option>
              ))}
            </select>
            <select 
              className="bg-white border border-gray-200 rounded-md px-3 py-2"
              value={format(currentDate, 'yyyy')}
              onChange={(e) => {
                const newDate = new Date(currentDate);
                newDate.setFullYear(parseInt(e.target.value));
                setCurrentDate(newDate);
              }}
            >
              {[2024, 2025].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowCreateAppointment(true)}>
            <Plus className="w-4 h-4 mr-2" /> New Appointment
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Calendar View */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-6">
            <Button variant="ghost" onClick={previousWeek} className="text-gray-600">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="grid grid-cols-7 flex-1 text-center">
              {weekDays.map(({ dayName, dayNumber }, index) => (
                <div key={index} className="flex flex-col items-center">
                  <span className="text-sm text-gray-500">{dayName}</span>
                  <span className="text-lg font-medium text-gray-900">{dayNumber}</span>
                </div>
              ))}
            </div>
            <Button variant="ghost" onClick={nextWeek} className="text-gray-600">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {renderCalendarView()}
        </div>

        {/* Appointments Management Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-xl font-medium mb-4 text-gray-900">Appointments Management</h2>
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger 
                value="pending" 
                className="relative data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Pending
                {pendingAppointments.length > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center">
                    {pendingAppointments.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="confirmed"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Confirmed
              </TabsTrigger>
              <TabsTrigger 
                value="cancelled"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
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
        </div>
      </div>

      {/* Render the create appointment dialog */}
      {renderCreateAppointmentDialog()}

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
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Appointment ID</h3>
                    <p className="font-mono">#{viewingAppointment.id}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                    <div>{getStatusBadge(viewingAppointment.status)}</div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
                    <p>{formatDate(viewingAppointment.created_at)}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Customer Name</h3>
                    <p>{viewingAppointment.user_name}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Customer Email</h3>
                    <p>{viewingAppointment.user_email}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Appointment Date & Time</h3>
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
                        className="border-red-500 text-red-500 hover:bg-red-500/10"
                        onClick={() => handleUpdateStatus(viewingAppointment.id, 'cancelled')}
                      >
                        <X size={16} className="mr-1" /> Cancel
                      </Button>
                      <Button 
                        className="bg-green-500 hover:bg-green-600 text-white"
                        onClick={() => handleUpdateStatus(viewingAppointment.id, 'confirmed')}
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