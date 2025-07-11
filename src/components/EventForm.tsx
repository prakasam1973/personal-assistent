
import React, { useState } from 'react';
import { DailyEvent } from '@/types/daily';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface EventFormProps {
  onSubmit: (event: Omit<DailyEvent, 'id'>) => void;
  onClose: () => void;
  selectedDate: Date | null;
}

export const EventForm: React.FC<EventFormProps> = ({
  onSubmit,
  onClose,
  selectedDate,
}) => {
  const [formData, setFormData] = useState({
    person: '',
    title: '',
    description: '',
    date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    notes: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};
    if (!formData.person.trim()) newErrors.person = 'Person name is required.';
    if (!formData.title.trim()) newErrors.title = 'Event title is required.';
    if (!formData.description.trim()) newErrors.description = 'Description is required.';
    if (!formData.date.trim()) newErrors.date = 'Date is required.';
    if (!formData.startTime.trim()) newErrors.startTime = 'Start time is required.';
    if (!formData.endTime.trim()) newErrors.endTime = 'End time is required.';
    if (!formData.notes.trim()) newErrors.notes = 'Notes is required.';

    // Check if selected date is a weekday
    if (formData.date) {
      const dateObj = new Date(formData.date);
      const day = dateObj.getDay();
      if (day === 0 || day === 6) {
        newErrors.date = 'Please select a weekday (Monday to Friday).';
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const eventData: Omit<DailyEvent, 'id'> = {
      ...formData,
      date: new Date(formData.date),
      status: 'scheduled',
    };

    onSubmit(eventData);
    // Reset form after submit
    setFormData({
      person: '',
      title: '',
      description: '',
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      notes: '',
    });
    setErrors({});
  };

  const handleChange = (field: string, value: string) => {
    // If changing date, check if it's a weekday
    if (field === 'date') {
      const dateObj = new Date(value);
      const day = dateObj.getDay();
      if (day === 0 || day === 6) {
        setErrors(prev => ({
          ...prev,
          date: 'Please select a weekday (Monday to Friday).'
        }));
      } else {
        setErrors(prev => {
          const { date, ...rest } = prev;
          return rest;
        });
      }
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: '#f4f8fb' }}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Add New Event</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="person">
              Person Name <span className="text-red-500" title="Required">*</span>
            </Label>
            <Input
              id="person"
              value={formData.person}
              onChange={(e) => handleChange('person', e.target.value)}
              placeholder="e.g., John Doe"
            />
          </div>

          <div>
            <Label htmlFor="title">
              Meeting Title <span className="text-red-500" title="Required">*</span>
            </Label>
            <select
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              className="border rounded px-3 py-2 w-full"
            >
              <option value="" disabled>
                Select meeting type
              </option>
              <option value="Weekly 1 X1">Weekly 1 X1</option>
              <option value="Monthly 1 x1">Monthly 1 x1</option>
              <option value="POD review">POD review</option>
              <option value="adhoc meeting">adhoc meeting</option>
              <option value="Staff meeting">Staff meeting</option>
              <option value="Operational Meeting">Operational Meeting</option>
            </select>
          </div>

          <div>
            <Label htmlFor="description">
              Description <span className="text-red-500" title="Required">*</span>
            </Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Event details..."
            />
          </div>

          <div>
            <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              required
            />
            <div className="text-xs text-gray-500 mt-1">
              Only weekdays (Monday to Friday) are allowed.
            </div>
            {errors.date && (
              <div className="text-xs text-red-500 mt-1">{errors.date}</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleChange('startTime', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleChange('endTime', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="e.g., Conference Room A"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes <span className="text-red-500">*</span></Label>
            <ReactQuill
              id="notes"
              value={formData.notes}
              onChange={(value) => handleChange('notes', value)}
              placeholder="Add any notes about this event... Use bullets and numbering from the toolbar."
              modules={{
                toolbar: [
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['bold', 'italic', 'underline'],
                  ['link'],
                  ['clean']
                ]
              }}
              style={{ minHeight: '160px', marginBottom: '8px' }}
            />
            <div className="text-xs text-gray-500 mt-1">
              Supports bullets and numbering using the toolbar above.
            </div>
            {errors.notes && (
              <div className="text-xs text-red-500 mt-1">{errors.notes}</div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              Add Event
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
