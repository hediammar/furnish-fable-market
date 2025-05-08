import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Appointment {
  id: number;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  user_id: string;
}

interface RendezVousModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  language: string;
}

const RendezVousModal: React.FC<RendezVousModalProps> = ({ open, onOpenChange, user, language }) => {
  const { toast } = useToast();
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
      if (error) throw error;
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
    if (hasAppointmentInSameWeek(selectedDate)) {
      toast({
        title: 'Rendez-vous non disponible',
        description: 'Vous avez déjà un rendez-vous prévu cette semaine. Veuillez choisir une autre semaine.',
        variant: 'destructive',
      });
      return;
    }
    if (!isTimeSlotAvailable(selectedDate, selectedTime)) {
      toast({
        title: 'Créneau non disponible',
        description: 'Ce créneau a été réservé entre-temps. Veuillez choisir un autre horaire.',
        variant: 'destructive',
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
        title: 'Rendez-vous confirmé',
        description: 'Votre rendez-vous a été enregistré avec succès.',
      });
      setIsConfirmationOpen(false);
      onOpenChange(false);
      setSelectedDate(undefined);
      setSelectedTime('');
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Une erreur est survenue lors de la création du rendez-vous.",
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
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
                  onOpenChange(false);
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
              onClick={() => onOpenChange(false)}
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
    </>
  );
};

export default RendezVousModal; 