
import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';

export const CalendarHeader: React.FC = () => {
  const today = new Date();
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Minutes of Meeting Tracker
          </h1>
          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{format(today, 'EEEE, MMMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>Stay organized, stay productive</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            {format(today, 'MMM dd')}
          </div>
          <div className="text-sm text-gray-500">Today</div>
        </div>
      </div>
    </div>
  );
};
