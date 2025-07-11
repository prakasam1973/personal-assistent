
import React, { useState } from 'react';
import { DailyEvent } from '@/types/daily';
import { Clock, MapPin, Trash2, FileText, Calendar, Check, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventNotes } from '@/components/EventNotes';
import { RescheduleDialog } from '@/components/RescheduleDialog';

interface EventCardProps {
  event: DailyEvent;
  onDelete: (eventId: string) => void;
  onUpdate: (event: DailyEvent) => void;
  onReschedule: (eventId: string, newDate: Date, newStartTime: string, newEndTime: string) => void;
  allEvents: DailyEvent[];
}

const statusColors = {
  scheduled: 'bg-blue-50 border-blue-200',
  completed: 'bg-green-50 border-green-200',
  cancelled: 'bg-red-50 border-red-200',
  rescheduled: 'bg-yellow-50 border-yellow-200',
};

const statusIcons = {
  scheduled: Clock,
  completed: Check,
  cancelled: X,
  rescheduled: RotateCcw,
};

export const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  onDelete, 
  onUpdate, 
  onReschedule, 
  allEvents
}) => {
  const [showNotes, setShowNotes] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  
  const StatusIcon = statusIcons[event.status];

  const handleStatusChange = (newStatus: DailyEvent['status']) => {
    onUpdate({ ...event, status: newStatus });
  };

  const handleNotesUpdate = (notes: string) => {
    onUpdate({ ...event, notes });
  };

  return (
    <>
      <div className={`border-l-4 border-l-blue-400 ${statusColors[event.status]} p-3 rounded-r border border-l-0 shadow-sm transition-all hover:shadow-md`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={`font-medium ${event.status === 'cancelled' ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                {event.title}
              </h4>
              <div className="flex items-center gap-1">
                <StatusIcon className="w-3 h-3" />
                <span className="text-xs capitalize">{event.status}</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">{event.description}</p>
            
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{event.startTime} - {event.endTime}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>

            {event.person && (
              <p className="text-xs text-gray-600 mb-2">
                <strong>Person:</strong> {event.person}
              </p>
            )}

            {event.notes && (
              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded mb-2">
                <strong>Notes:</strong>{" "}
                <span
                  dangerouslySetInnerHTML={{ __html: event.notes }}
                />
              </div>
            )}

            <div className="flex flex-wrap gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotes(true)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-6 px-2 text-xs"
              >
                <FileText className="w-3 h-3 mr-1" />
                Notes
              </Button>
              
              {event.status === 'scheduled' && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReschedule(true)}
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 h-6 px-2 text-xs"
                  >
                    <Calendar className="w-3 h-3 mr-1" />
                    Reschedule
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStatusChange('completed')}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50 h-6 px-2 text-xs"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Complete
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStatusChange('cancelled')}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 px-2 text-xs"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Cancel
                  </Button>
                </>
              )}
              
              {event.status !== 'scheduled' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleStatusChange('scheduled')}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-6 px-2 text-xs"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Restore
                </Button>
              )}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(event.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <EventNotes
        isOpen={showNotes}
        onClose={() => setShowNotes(false)}
        event={event}
        onUpdateNotes={handleNotesUpdate}
      />

      <RescheduleDialog
        isOpen={showReschedule}
        onClose={() => setShowReschedule(false)}
        event={event}
        onReschedule={onReschedule}
        allEvents={allEvents}
      />
    </>
  );
};
