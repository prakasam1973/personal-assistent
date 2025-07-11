
import React, { useState } from 'react';
import { format, isSameDay, addDays, startOfWeek } from 'date-fns';
import { DailyEvent } from '@/types/daily';
import { EventCard } from '@/components/EventCard';
import { PrintView } from '@/components/PrintView';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarGridProps {
  events: DailyEvent[];
  onDateSelect: (date: Date) => void;
  onDeleteEvent: (eventId: string) => void;
  onUpdateEvent: (event: DailyEvent) => void;
  onRescheduleEvent: (eventId: string, newDate: Date, newStartTime: string, newEndTime: string) => void;
  filter?: 'all' | 'withEvents';
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  events,
  onDateSelect,
  onDeleteEvent,
  onUpdateEvent,
  onRescheduleEvent,
  filter,
}) => {
  // Removed printDate state (Print Day functionality)
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    return startOfWeek(today, { weekStartsOn: 1 }); // Start week on Monday
  });

  // Expanded state for event accordions: { [eventId]: boolean }
  const [expandedEvents, setExpandedEvents] = useState<{ [eventId: string]: boolean }>({});

  const getDaysInWeek = () => {
    const days = [];
    // Only show Monday to Friday (5 days)
    for (let i = 0; i < 5; i++) {
      days.push(addDays(currentWeekStart, i));
    }
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeekStart = addDays(currentWeekStart, direction === 'next' ? 7 : -7);
    setCurrentWeekStart(newWeekStart);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentWeekStart(startOfWeek(today, { weekStartsOn: 1 }));
  };

  let days = getDaysInWeek();
  const today = new Date();

  // Filter days if needed
  if (filter === 'withEvents') {
    days = days.filter(day => getEventsForDate(day).length > 0);
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Weekly Schedule (Mon-Fri)</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
              Previous Week
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
              Next Week
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isToday = isSameDay(day, today);
            
            return (
              <div key={index} className={`border rounded-lg p-4 transition-colors w-full ${
                isToday ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className={`text-lg font-medium ${
                      isToday ? 'text-blue-800' : 'text-gray-800'
                    }`}>
                      {format(day, 'EEEE, MMMM dd')}
                      {isToday && <span className="ml-2 text-sm text-blue-600">(Today)</span>}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {/* Print Day button removed */}
                    <button
                      onClick={() => onDateSelect(day)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Add Event
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {dayEvents.length > 0 ? (
                    dayEvents.map(event => (
                      <div key={event.id} className="border rounded">
                        <div
                          className="flex items-center justify-between cursor-pointer px-3 py-2 bg-gray-50 hover:bg-blue-50"
                          onClick={() =>
                            setExpandedEvents(prev => ({
                              ...prev,
                              [event.id]: !prev[event.id],
                            }))
                          }
                        >
                          <span className="font-medium text-gray-700">{event.title || "Event"}</span>
                          <span className="text-xs text-gray-500">
                            {expandedEvents[event.id] ? "▲" : "▼"}
                          </span>
                        </div>
                        {expandedEvents[event.id] && (
                          <div className="p-2">
                            <EventCard
                              event={event}
                              onDelete={onDeleteEvent}
                              onUpdate={onUpdateEvent}
                              onReschedule={onRescheduleEvent}
                              allEvents={events}
                            />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm italic">No events scheduled</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PrintView for Print Day removed */}
    </>
  );
};
