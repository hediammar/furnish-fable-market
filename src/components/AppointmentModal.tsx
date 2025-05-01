import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { appointmentService, AppointmentSlot } from '@/services/appointmentService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [availableSlots, setAvailableSlots] = useState<AppointmentSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (selectedDate) {
      const fetchSlots = async () => {
        try {
          const slots = await appointmentService.getAvailableSlots(
            format(selectedDate, 'yyyy-MM-dd')
          );
          setAvailableSlots(slots);
        } catch (error) {
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
    setSelectedSlot(time);
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedSlot || !isAuthenticated) return;

    setIsLoading(true);
    try {
      await appointmentService.createAppointment(
        format(selectedDate, 'yyyy-MM-dd'),
        selectedSlot
      );
      toast({
        title: 'Succès',
        description: 'Votre rendez-vous a été pris avec succès',
      });
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <div className="flex flex-col md:flex-row">
          {/* Calendar Section */}
          <div className="w-full md:w-1/2 p-6 border-r border-gray-200">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-medium">Choisir une date</DialogTitle>
            </DialogHeader>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              locale={fr}
              disabled={(date) => date < new Date()}
              className="rounded-md border-none"
              classNames={{
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
              }}
              components={{
                IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
                IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
              }}
            />
          </div>

          {/* Time Slots Section */}
          <div className="w-full md:w-1/2 p-6">
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
                      className={`h-12 rounded-lg transition-all duration-200 ${
                        !slot.isAvailable ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {slot.time}
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
  );
}; 