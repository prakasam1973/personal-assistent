
import React, { useState } from 'react';
import { DailyEvent } from '@/types/daily';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Calendar, AlertTriangle } from 'lucide-react';
import { format, isSameDay, parse } from 'date-fns';

interface RescheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event: DailyEvent;
  onReschedule: (eventId: string, newDate: Date, newStartTime: string, newEndTime: string) => void;
  allEvents: DailyEvent[];
}

export const RescheduleDialog: React.FC<RescheduleDialogProps> = ({
  isOpen,
  onClose,
  event,
  onReschedule,
  allEvents,
}) => {
  const [newDate, setNewDate] = useState(format(event.date, 'yyyy-MM-dd'));
  const [newStartTime, setNewStartTime] = useState(event.startTime);
  const [newEndTime, setNewEndTime] = useState(event.endTime);
  const [conflicts, setConflicts] = useState<DailyEvent[]>([]);

  const checkConflicts = (date: string, startTime: string, endTime: string) => {
    const selectedDate = new Date(date);
    const conflictingEvents = allEvents.filter(e => {
      if (e.id === event.id || e.status === 'cancelled') return false;
      
      if (!isSameDay(e.date, selectedDate)) return false;
      
      const eventStart = parse(e.startTime, 'HH:mm', new Date());
      const eventEnd = parse(e.endTime, 'HH:mm', new Date());
      const newStart = parse(startTime, 'HH:mm', new Date());
      const newEnd = parse(endTime, 'HH:mm', new Date());
      
      return (newStart < eventEnd && newEnd > eventStart);
    });
    
    setConflicts(conflictingEvents);
  };

  const handleDateTimeChange = (field: string, value: string) => {
    let updatedDate = newDate;
    let updatedStartTime = newStartTime;
    let updatedEndTime = newEndTime;
    
    if (field === 'date') {
      updatedDate = value;
      setNewDate(value);
    } else if (field === 'startTime') {
      updatedStartTime = value;
      setNewStartTime(value);
    } else if (field === 'endTime') {
      updatedEndTime = value;
      setNewEndTime(value);
    }
    
    checkConflicts(updatedDate, updatedStartTime, updatedEndTime);
  };

  const handleReschedule = () => {
    if (new Date(`1970-01-01T${newStartTime}`) >= new Date(`1970-01-01T${newEndTime}`)) {
      alert('End time must be after start time');
      return;
    }
    
    onReschedule(event.id, new Date(newDate), newStartTime, newEndTime);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-800">Reschedule Event</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <h3 className="font-medium text-gray-800 mb-1">{event.title}</h3>
            <p className="text-sm text-gray-600">
              Currently: {format(event.date, 'MMM dd, yyyy')} at {event.startTime} - {event.endTime}
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="newDate">New Date</Label>
              <Input
                id="newDate"
                type="date"
                value={newDate}
                onChange={(e) => handleDateTimeChange('date', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newStartTime">New Start Time</Label>
                <Input
                  id="newStartTime"
                  type="time"
                  value={newStartTime}
                  onChange={(e) => handleDateTimeChange('startTime', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="newEndTime">New End Time</Label>
                <Input
                  id="newEndTime"
                  type="time"
                  value={newEndTime}
                  onChange={(e) => handleDateTimeChange('endTime', e.target.value)}
                  required
                />
              </div>
            </div>

            {conflicts.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Schedule Conflicts</span>
                </div>
                <div className="space-y-1">
                  {conflicts.map(conflict => (
                    <p key={conflict.id} className="text-xs text-yellow-700">
                      • {conflict.title} ({conflict.startTime} - {conflict.endTime})
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleReschedule} 
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              disabled={conflicts.length > 0}
            >
              Reschedule Event
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
