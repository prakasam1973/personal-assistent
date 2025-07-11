
import React from 'react';
import { format } from 'date-fns';
import { DailyEvent } from '@/types/daily';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PrintViewProps {
  date: Date;
  events: DailyEvent[];
  onClose: () => void;
}

export const PrintView: React.FC<PrintViewProps> = ({ date, events, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const sortedEvents = events.sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      <div className="max-w-4xl mx-auto p-8 print-container">
        {/* Print header - hidden on screen, visible when printing */}
        <div className="print:block hidden mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">Daily Schedule</h1>
          <h2 className="text-xl text-center text-gray-600">
            {format(date, 'EEEE, MMMM dd, yyyy')}
          </h2>
        </div>

        {/* Screen header - visible on screen, hidden when printing */}
        <div className="print:hidden flex items-center justify-between mb-6 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold">Print Schedule</h1>
            <h2 className="text-lg text-gray-600">
              {format(date, 'EEEE, MMMM dd, yyyy')}
            </h2>
          </div>
          <div className="flex gap-2">
            <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        {/* Events list */}
        <div className="space-y-6">
          {sortedEvents.length > 0 ? (
            sortedEvents.map((event, index) => (
              <div key={event.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="mb-3">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {index + 1}. {event.title}
                  </h3>
                  <div className="text-sm text-gray-600 mb-3">
                    <div className="mb-1">
                      <strong>Date:</strong> {format(event.date, 'EEEE, MMMM dd, yyyy')}
                    </div>
                    <div className="mb-1">
                      <strong>Time:</strong> {event.startTime} - {event.endTime}
                    </div>
                  </div>
                </div>

                {event.description && (
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-700 mb-1">Description:</h4>
                    <p className="text-gray-600 leading-relaxed">{event.description}</p>
                  </div>
                )}

                {event.notes && (
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-700 mb-1">Notes:</h4>
                    <div className="bg-gray-50 p-3 rounded border-l-4 border-blue-200">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {event.notes}
                      </p>
                    </div>
                  </div>
                )}

                {!event.description && !event.notes && (
                  <p className="text-gray-400 italic">No additional details or notes</p>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No events scheduled for this day</p>
            </div>
          )}
        </div>

        {/* Print footer */}
        <div className="print:block hidden mt-8 pt-4 border-t text-center text-sm text-gray-500">
          <p>Generated from Daily Event Tracker - {format(new Date(), 'MMMM dd, yyyy')}</p>
        </div>
      </div>
    </div>
  );
};
