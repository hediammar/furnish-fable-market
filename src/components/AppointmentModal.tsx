import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { appointmentService, AppointmentSlot, Appointment } from '@/services/appointmentService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [availableSlots, setAvailableSlots] = useState<AppointmentSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Fetch appointments when the modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchAppointments = async () => {
        try {
          const userAppointments = await appointmentService.getUserAppointments();
          console.log('Fetched appointments:', userAppointments);
          setAppointments(userAppointments);
        } catch (error) {
          console.error('Error fetching appointments:', error);
          toast({
            title: 'Erreur',
            description: 'Impossible de charger les rendez-vous',
            variant: 'destructive',
          });
        }
      };
      fetchAppointments();
    }
  }, [isOpen, toast]);

  useEffect(() => {
    if (selectedDate) {
      const fetchSlots = async () => {
        try {
          const formattedDate = format(selectedDate, 'yyyy-MM-dd');
          console.log('Fetching slots for date:', formattedDate);
          const slots = await appointmentService.getAvailableSlots(formattedDate);
          console.log('Received slots:', slots);
          setAvailableSlots(slots);
        } catch (error) {
          console.error('Error fetching slots:', error);
          toast({
            title: 'Erreur',
            description: 'Impossible de charger les créneaux disponibles',
            variant: 'destructive',
          });
        }
      };
      fetchSlots();
    }
  }, [selectedDate, toast]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (time: string) => {
    console.log('Attempting to select slot:', time);
    const slot = availableSlots.find(s => s.time === time);
    console.log('Found slot:', slot);
    
    if (!slot) {
      console.log('Slot not found in available slots');
      return;
    }
    
    if (!slot.isAvailable) {
      console.log('Slot is not available');
      toast({
        title: 'Erreur',
        description: 'Ce créneau n\'est pas disponible',
        variant: 'destructive',
      });
      return;
    }
    
    console.log('Setting selected slot:', time);
    setSelectedSlot(time);
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedSlot || !isAuthenticated) return;

    console.log('Submitting appointment:', { date: selectedDate, time: selectedSlot });
    
    // Additional validation to ensure the slot is still available
    const selectedSlotData = availableSlots.find(slot => slot.time === selectedSlot);
    console.log('Selected slot data:', selectedSlotData);
    
    if (!selectedSlotData || !selectedSlotData.isAvailable) {
      console.log('Slot is not available for submission');
      toast({
        title: 'Erreur',
        description: 'Ce créneau n\'est plus disponible. Veuillez en choisir un autre.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Check if user already has an appointment in the same week
      const hasExistingAppointment = await appointmentService.checkExistingAppointmentInWeek(
        format(selectedDate, 'yyyy-MM-dd')
      );

      if (hasExistingAppointment) {
        toast({
          title: 'Attention',
          description: 'Vous ne pouvez pas prendre plus d\'un rendez-vous par semaine. Veuillez choisir une autre semaine. Merci!',
          variant: 'destructive',
        });
        return;
      }

      setShowConfirmation(true);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de prendre le rendez-vous',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmAppointment = async () => {
    if (!selectedDate || !selectedSlot) return;

    setIsLoading(true);
    try {
      await appointmentService.createAppointment(
        format(selectedDate, 'yyyy-MM-dd'),
        selectedSlot
      );
      // Refresh appointments after creating a new one
      const userAppointments = await appointmentService.getUserAppointments();
      setAppointments(userAppointments);
      
      toast({
        title: 'Succès',
        description: 'Votre rendez-vous a été pris avec succès',
      });
      setShowConfirmation(false);
      onClose();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de prendre le rendez-vous',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startOfWeek(currentDate), i);
    return {
      date,
      dayName: format(date, 'EEE', { locale: fr }),
      dayNumber: format(date, 'd')
    };
  });

  // Generate time slots
  const timeSlots = Array.from({ length: 20 }, (_, i) => {
    const hour = 9 + Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  // Get appointments for a specific date and time
  const getAppointmentsForDateAndTime = (date: Date, time: string) => {
    const appointmentsForDate = appointments.filter(appointment => {
      // Convert both dates to YYYY-MM-DD format for comparison
      const appointmentDateStr = appointment.appointment_date;
      const currentDateStr = format(date, 'yyyy-MM-dd');
      
      // Compare dates and times
      const isSameDate = appointmentDateStr === currentDateStr;
      const isSameTime = appointment.appointment_time === time;
      
      console.log('Checking appointment:', {
        appointmentDate: appointmentDateStr,
        currentDate: currentDateStr,
        isSameDate,
        appointmentTime: appointment.appointment_time,
        time,
        isSameTime
      });
      
      return isSameDate && isSameTime;
    });
    
    console.log('Appointments for date and time:', { 
      date: format(date, 'yyyy-MM-dd'), 
      time, 
      appointmentsForDate 
    });
    
    return appointmentsForDate;
  };

  const previousWeek = () => {
    setCurrentDate(prev => addDays(prev, -7));
  };

  const nextWeek = () => {
    setCurrentDate(prev => addDays(prev, 7));
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[800px] p-0">
          <div className="flex flex-col">
            {/* Calendar Section */}
            <div className="p-6 border-b border-gray-200">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-xl font-medium">Calendrier des rendez-vous</DialogTitle>
              </DialogHeader>
              
              <div className="flex justify-between items-center mb-4">
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
                                  "border-green-500 bg-green-50"
                                )}
                              >
                                <div className="font-medium truncate">Rendez-vous</div>
                                <div className="text-xs text-gray-500 truncate">
                                  {appointment.appointment_time}
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
            </div>

            {/* Time Slots Section */}
            <div className="p-6">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-xl font-medium">Choisir un créneau</DialogTitle>
              </DialogHeader>
              
              {selectedDate ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot.time}
                        variant={selectedSlot === slot.time ? 'default' : 'outline'}
                        disabled={!slot.isAvailable}
                        onClick={() => handleSlotSelect(slot.time)}
                        className={cn(
                          "h-12 rounded-lg transition-all duration-200",
                          !slot.isAvailable && "opacity-50 cursor-not-allowed bg-gray-100"
                        )}
                      >
                        {slot.time}
                        {!slot.isAvailable && (
                          <span className="ml-2 text-xs text-gray-500">(Réservé)</span>
                        )}
                      </Button>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <Button
                      onClick={handleSubmit}
                      disabled={!selectedDate || !selectedSlot || isLoading || !isAuthenticated}
                      className="w-full h-12"
                    >
                      {isLoading ? 'Enregistrement...' : 'Confirmer le rendez-vous'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Veuillez sélectionner une date pour voir les créneaux disponibles
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer le rendez-vous</DialogTitle>
            <DialogDescription>
              Veuillez vérifier les détails de votre rendez-vous avant de confirmer.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Date</h4>
                <p>{selectedDate && format(selectedDate, 'PPP', { locale: fr })}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Heure</h4>
                <p>{selectedSlot}</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmation(false)}>
              Annuler
            </Button>
            <Button onClick={confirmAppointment} disabled={isLoading}>
              {isLoading ? 'Enregistrement...' : 'Confirmer le rendez-vous'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}; 