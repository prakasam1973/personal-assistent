
import React, { useState, useRef } from 'react';
import { DailyEvent } from '@/types/daily';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, FileText } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface EventNotesProps {
  isOpen: boolean;
  onClose: () => void;
  event: DailyEvent;
  onUpdateNotes: (notes: string) => void;
}

export const EventNotes: React.FC<EventNotesProps> = ({
  isOpen,
  onClose,
  event,
  onUpdateNotes,
}) => {
  const [notes, setNotes] = useState(event.notes || '');
  const [currentListType, setCurrentListType] = useState<'bullet' | 'numbered' | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = () => {
    onUpdateNotes(notes);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && currentListType) {
      e.preventDefault();
      
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const beforeText = notes.substring(0, start);
      const afterText = notes.substring(start);
      
      // Check if we're in a list item
      const lines = beforeText.split('\n');
      const currentLine = lines[lines.length - 1];
      
      let newText;
      let cursorOffset = 0;
      
      if (currentListType === 'bullet' && currentLine.trim().startsWith('•')) {
        // Continue bullet list
        newText = beforeText + '\n• ' + afterText;
        cursorOffset = 3;
      } else if (currentListType === 'numbered' && /^\d+\./.test(currentLine.trim())) {
        // Continue numbered list
        const match = currentLine.trim().match(/^(\d+)\./);
        if (match) {
          const nextNumber = parseInt(match[1]) + 1;
          newText = beforeText + `\n${nextNumber}. ` + afterText;
          cursorOffset = `${nextNumber}. `.length + 1;
        } else {
          newText = beforeText + '\n' + afterText;
          cursorOffset = 1;
        }
      } else {
        // Regular enter
        newText = beforeText + '\n' + afterText;
        cursorOffset = 1;
      }
      
      setNotes(newText);
      
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + cursorOffset;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  const insertBulletPoint = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = notes.substring(start, end);
    const beforeText = notes.substring(0, start);
    const afterText = notes.substring(end);

    let newText;
    let cursorOffset = 0;
    
    if (selectedText) {
      // If text is selected, add bullet to each line
      const lines = selectedText.split('\n');
      const bulletedLines = lines.map(line => line.trim() ? `• ${line}` : line);
      newText = beforeText + bulletedLines.join('\n') + afterText;
      cursorOffset = newText.length - notes.length;
    } else {
      // If no selection, add bullet at cursor position
      const lineStart = beforeText.lastIndexOf('\n') + 1;
      const currentLine = beforeText.substring(lineStart);
      
      if (currentLine.trim() === '') {
        newText = beforeText + '• ' + afterText;
        cursorOffset = 2;
      } else {
        newText = beforeText + '\n• ' + afterText;
        cursorOffset = 3;
      }
    }

    setNotes(newText);
    setCurrentListType('bullet');
    
    // Focus textarea and set cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = selectedText ? start + cursorOffset : start + cursorOffset;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertNumberedList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = notes.substring(start, end);
    const beforeText = notes.substring(0, start);
    const afterText = notes.substring(end);

    let newText;
    let cursorOffset = 0;
    
    if (selectedText) {
      // If text is selected, add numbers to each line
      const lines = selectedText.split('\n');
      const numberedLines = lines.map((line, index) => 
        line.trim() ? `${index + 1}. ${line}` : line
      );
      newText = beforeText + numberedLines.join('\n') + afterText;
      cursorOffset = newText.length - notes.length;
    } else {
      // If no selection, add number at cursor position
      const lineStart = beforeText.lastIndexOf('\n') + 1;
      const currentLine = beforeText.substring(lineStart);
      
      if (currentLine.trim() === '') {
        newText = beforeText + '1. ' + afterText;
        cursorOffset = 3;
      } else {
        newText = beforeText + '\n1. ' + afterText;
        cursorOffset = 4;
      }
    }

    setNotes(newText);
    setCurrentListType('numbered');
    
    // Focus textarea and set cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = selectedText ? start + cursorOffset : start + cursorOffset;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const detectListType = (text: string, cursorPosition: number) => {
    const beforeCursor = text.substring(0, cursorPosition);
    const lines = beforeCursor.split('\n');
    const currentLine = lines[lines.length - 1];
    
    if (currentLine.trim().startsWith('•')) {
      setCurrentListType('bullet');
    } else if (/^\d+\./.test(currentLine.trim())) {
      setCurrentListType('numbered');
    } else {
      setCurrentListType(null);
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setNotes(newValue);
    detectListType(newValue, e.target.selectionStart);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Event Notes</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <h3 className="font-medium text-gray-800 mb-1">{event.title}</h3>
            <p className="text-sm text-gray-600">{event.description}</p>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="notes">Notes</Label>
            <ReactQuill
              id="notes"
              value={notes}
              onChange={setNotes}
              placeholder="Add your notes about this event... Use bullets and numbering from the toolbar."
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
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700">
              Save Notes
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
