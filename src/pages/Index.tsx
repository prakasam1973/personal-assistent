
import pkg from '../../../package.json';
import React, { useState, useEffect } from 'react';
import { CalendarHeader } from '@/components/CalendarHeader';
import MomNotesList from "./MomNotesList";
import DailySteps from "./DailySteps";
import Joke from "./Joke";
import { DailyEvent } from '@/types/daily';
import { Button } from '@/components/ui/button';
import { Plus, Database, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveEvents, loadEvents, clearEvents } from '@/utils/storage';
import { clearMomNotes } from '@/utils/momNotesDb';
import { useNavigate } from "react-router-dom";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import NotepadModal from "@/components/NotepadModal";

const Index = () => {
  const [events, setEvents] = useState<DailyEvent[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  // calendarFilter and showFilterMenu removed
  const { toast } = useToast();

  const navigate = useNavigate();
  // Use a single state for active view: "menu", "joke", "todos", "steps", "about"
  const [activeView, setActiveView] = useState<"menu" | "joke" | "todos" | "steps" | "about" | "goals" | "inspiration" | "notepad">("menu");

  // Handler for "Track Minutes of Meeting"
  // Handler functions for navigation
  const handleTrackMom = () => setActiveView("todos");
  const handleTrackSteps = () => setActiveView("steps");
  const handleShowJoke = () => setActiveView("joke");
  const handleShowDashboard = () => setActiveView("menu");

  // Load events from localStorage on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      const loadedEvents = await loadEvents();
      setEvents(loadedEvents);
    };
    fetchEvents();
  }, []);

  // Save events to localStorage whenever events change
  useEffect(() => {
    const persistEvents = async () => {
      if (events.length > 0) {
        await saveEvents(events);
      }
    };
    persistEvents();
  }, [events]);

  // Current week dates for initial view
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const handleAddEvent = async (eventData: Omit<DailyEvent, 'id'>) => {
    const newEvent: DailyEvent = {
      ...eventData,
      id: Date.now().toString(),
    };
    setEvents(prev => {
      const updated = [...prev, newEvent];
      return updated;
    });
    // Save after state update
    await saveEvents([...events, newEvent]);
    setShowEventForm(false);
    toast({
      title: "Event Added",
      description: `${eventData.title} has been added to your schedule.`,
    });
  };

  const handleUpdateEvent = async (updatedEvent: DailyEvent) => {
    setEvents(prev => {
      const updated = prev.map(event =>
        event.id === updatedEvent.id ? updatedEvent : event
      );
      return updated;
    });
    await saveEvents(events.map(event => event.id === updatedEvent.id ? updatedEvent : event));
    toast({
      title: "Event Updated",
      description: `${updatedEvent.title} has been updated.`,
    });
  };

  const handleRescheduleEvent = async (eventId: string, newDate: Date, newStartTime: string, newEndTime: string) => {
    setEvents(prev => {
      const updated = prev.map(event => {
        if (event.id === eventId) {
          const rescheduledEvent = {
            ...event,
            date: newDate,
            startTime: newStartTime,
            endTime: newEndTime,
            status: 'scheduled' as const,
            originalEventId: event.originalEventId || event.id,
          };
          return rescheduledEvent;
        }
        return event;
      });
      return updated;
    });
    await saveEvents(events.map(event =>
      event.id === eventId
        ? { ...event, date: newDate, startTime: newStartTime, endTime: newEndTime, status: 'scheduled' as const, originalEventId: event.originalEventId || event.id }
        : event
    ));
    toast({
      title: "Event Rescheduled",
      description: "Event has been moved to the new date and time.",
    });
  };

  const handleDeleteEvent = async (eventId: string) => {
    setEvents(prev => {
      const updated = prev.filter(event => event.id !== eventId);
      return updated;
    });
    await saveEvents(events.filter(event => event.id !== eventId));
    toast({
      title: "Event Deleted",
      description: "Event has been removed from your schedule.",
    });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowEventForm(true);
  };

  // handleClearAllData removed

  // Get event statistics
  const eventStats = {
    today: events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate.toDateString() === today.toDateString();
    }).length,
    thisWeek: events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate >= startOfWeek && eventDate <= endOfWeek;
    }).length,
    scheduled: events.filter(e => e.status === 'scheduled').length,
    completed: events.filter(e => e.status === 'completed').length,
  };

  // Dialog state for Local Storage and Quick Stats
  // showLocalStorage and showQuickStats removed
  const [showReminders, setShowReminders] = useState(false);
  const [reminders, setReminders] = useState<{ id: string; title: string; date: string; time: string }[]>(() => {
    const saved = localStorage.getItem("reminders");
    return saved ? JSON.parse(saved) : [];
  });
  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderDateTime, setReminderDateTime] = useState("");
  const [reminderError, setReminderError] = useState<string | null>(null);

  // Helper to get default reminder date-time string with 10:00 as default time
  function getDefaultReminderDateTime() {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T10:00`;
  }

  // Helper to get current datetime-local string
  function getCurrentDateTimeLocal() {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }

  // Reminder alert state
  const [dueReminder, setDueReminder] = useState<{ id: string; title: string; date: string; time: string } | null>(null);

  // Track alerted reminders to avoid duplicate alerts
  const [alertedReminderIds, setAlertedReminderIds] = useState<string[]>([]);

  // Poll for due reminders every 10 seconds
  React.useEffect(() => {
    if (!reminders.length) return;
    const interval = setInterval(() => {
      const now = new Date();
      reminders.forEach((r) => {
        const reminderDate = new Date(`${r.date}T${r.time}`);
        const diff = now.getTime() - reminderDate.getTime();
        // Trigger if due within the last minute and not already alerted
        if (
          diff >= 0 &&
          diff < 60000 &&
          !alertedReminderIds.includes(r.id) &&
          !dueReminder
        ) {
          setDueReminder(r);
          setAlertedReminderIds((prev) => [...prev, r.id]);
        }
      });
    }, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [reminders, dueReminder, alertedReminderIds]);

  // Set default date and time when Reminders modal opens
  React.useEffect(() => {
    if (showReminders) {
      setReminderDateTime(getDefaultReminderDateTime());
    }
  }, [showReminders]);

  const [showChangelog, setShowChangelog] = useState(false);

  return (
    <div className="flex flex-col items-center min-h-screen pt-16 bg-gray-100 font-[Segoe UI]">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl p-0 border border-gray-200 flex-1 flex flex-col overflow-auto">
        {/* Hero Section */}
        <div className="w-full flex flex-col items-center text-center px-8 py-8 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="flex items-center justify-center mb-4">
            <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 shadow">
              <span className="text-3xl font-bold text-blue-700 select-none">PS</span>
            </span>
          </div>
          <div className="mb-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Prakasam's Personal Assistant</span>
          </div>
          <p className="text-base text-gray-600 max-w-2xl mx-auto mb-2">Your all-in-one dashboard Prakasam. Enjoy!</p>
        </div>

        {/* Menu Section */}
        {/* Main Content: Show menu or todo list */}
        {activeView === "joke" && (
          <div className="px-8 py-8">
            <div className="flex justify-end mb-4">
              <Button
                onClick={handleShowDashboard}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Back to Dashboard
              </Button>
            </div>
            <Joke />
          </div>
        )}
        {activeView === "todos" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
            <div className="relative w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden bg-white">
              <div className="flex justify-end p-4">
                <Button
                  onClick={handleShowDashboard}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Close
                </Button>
              </div>
              <div className="p-4">
                <MomNotesList />
              </div>
            </div>
          </div>
        )}
        {activeView === "steps" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
            <div className="relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden bg-white">
              {/* Cross (×) button removed */}
              <div className="flex justify-end p-4">
                <Button
                  onClick={handleShowDashboard}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Close
                </Button>
              </div>
              <div className="p-4">
                <DailySteps />
              </div>
            </div>
          </div>
        )}
        {activeView === "menu" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-8 py-8">
            <button
              onClick={handleTrackMom}
              className="flex flex-col items-center justify-center bg-gradient-to-br from-green-200 to-green-100 rounded-xl shadow hover:scale-105 transition p-6 border-2 border-green-300 focus:outline-none"
            >
              <span className="mb-2">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 12l2 2l4-4" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </span>
              <span className="font-semibold text-lg text-green-900">Track Minutes of Meeting</span>
              <span className="text-sm text-green-700 mt-1">View and manage your todo/action items</span>
            </button>
            <button
              onClick={handleTrackSteps}
              className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 to-cyan-100 rounded-xl shadow hover:scale-105 transition p-6 border-2 border-blue-300 focus:outline-none"
            >
              <span className="mb-2">
                <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 17v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <span className="font-semibold text-lg text-cyan-900">Track My Daily Steps</span>
              <span className="text-sm text-cyan-700 mt-1">Log and view your daily step count</span>
            </button>
            {/* Stock Market menu removed */}
            {/* Clear All Data button removed */}
            {/* Local Storage and Quick Stats buttons removed */}
            <button
              onClick={() => navigate("/csr-events")}
              className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 to-cyan-100 rounded-xl shadow hover:scale-105 transition p-6 border-2 border-blue-300 focus:outline-none"
            >
              <span className="mb-2">
                <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 20v-6M6 20v-4M18 20v-2" />
                  <circle cx="12" cy="10" r="4" />
                </svg>
              </span>
              <span className="font-semibold text-lg text-cyan-900">CSR Events</span>
              <span className="text-sm text-cyan-700 mt-1">Corporate Social Responsibility</span>
            </button>
            <button
              onClick={() => navigate("/attendance")}
              className="flex flex-col items-center justify-center bg-gradient-to-br from-purple-200 to-purple-100 rounded-xl shadow hover:scale-105 transition p-6 border-2 border-purple-300 focus:outline-none"
            >
              <span className="mb-2">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M8 17v-1a4 4 0 0 1 8 0v1" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <span className="font-semibold text-lg text-purple-900">Attendance</span>
              <span className="text-sm text-purple-700 mt-1">Track your attendance</span>
            </button>
            <button
              onClick={() => setShowReminders(true)}
              className="flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl shadow hover:scale-105 transition p-6 border-2 border-purple-200 focus:outline-none"
            >
              <span className="mb-2">
                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </span>
              <span className="font-semibold text-lg text-pink-900">Reminders</span>
              <span className="text-sm text-pink-700 mt-1">Set personal reminders</span>
            </button>
              <button
                onClick={() => setActiveView("goals")}
                className="flex flex-col items-center justify-center bg-gradient-to-br from-green-200 to-green-100 rounded-xl shadow hover:scale-105 transition p-6 border-2 border-green-300 focus:outline-none"
              >
                <span className="mb-2">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 20v-6M6 20v-4M18 20v-2" />
                    <circle cx="12" cy="10" r="4" />
                  </svg>
                </span>
                <span className="font-semibold text-lg text-green-900">Goal Tracker</span>
                <span className="text-sm text-green-700 mt-1">Track daily, weekly, and monthly goals</span>
              </button>
              <button
                onClick={() => setActiveView("notepad")}
                className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 to-blue-100 rounded-xl shadow hover:scale-105 transition p-6 border-2 border-blue-300 focus:outline-none"
              >
                <span className="mb-2">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                    <path d="M8 8h8M8 12h8M8 16h4" />
                  </svg>
                </span>
                <span className="font-semibold text-lg text-blue-900">Notepad</span>
                <span className="text-sm text-blue-700 mt-1">Create, edit, and delete notes</span>
              </button>
              <button
                onClick={() => setActiveView("inspiration")}
                className="flex flex-col items-center justify-center bg-gradient-to-br from-orange-200 to-yellow-100 rounded-xl shadow hover:scale-105 transition p-6 border-2 border-orange-300 focus:outline-none"
              >
                <span className="mb-2">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 2v20M2 12h20" />
                  </svg>
                </span>
                <span className="font-semibold text-lg text-orange-900">Inspiration</span>
                <span className="text-sm text-orange-700 mt-1">Quote or Tip of the Day</span>
              </button>
              <button
                onClick={() => setActiveView("about")}
                className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-200 to-gray-100 rounded-xl shadow hover:scale-105 transition p-6 border-2 border-gray-300 focus:outline-none"
              >
                <span className="mb-2">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                </span>
                <span className="font-semibold text-lg text-gray-900">About App</span>
                <span className="text-sm text-gray-700 mt-1">Version & Tech Stack</span>
              </button>
          </div>
        )}
        {activeView === "goals" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
            <div className="relative w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden bg-white">
              <div className="flex justify-end p-4">
                <Button
                  onClick={handleShowDashboard}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Close
                </Button>
              </div>
              <div className="p-4">
                <GoalTrackerSection />
              </div>
            </div>
          </div>
        )}
        {activeView === "inspiration" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
            <div className="relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden bg-white">
              <div className="flex justify-end p-4">
                <Button
                  onClick={handleShowDashboard}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Close
                </Button>
              </div>
              <div className="p-4">
                <InspirationSection />
              </div>
            </div>
          </div>
        )}

        {/* Notepad Modal */}
        {activeView === "notepad" && (
          <NotepadModal onClose={() => setActiveView("menu")} />
        )}
        {/* Duplicate MomNotesList rendering removed */}

        {/* Local Storage and Quick Stats dialogs removed */}

        {/* Reminders Dialog */}
        {showReminders && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-50">
            <div className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
              {/* Gradient header bar */}
              <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-700 to-pink-500">
                <h3 className="text-lg font-semibold text-white drop-shadow">Personal Reminders</h3>
                <button
                  className="text-white text-2xl font-bold hover:text-pink-200 transition"
                  onClick={() => setShowReminders(false)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <div className="px-6 py-6 bg-white/90 rounded-b-2xl">
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    if (!reminderTitle.trim() || !reminderDateTime) {
                      setReminderError("All fields are required.");
                      return;
                    }
                    const [date, time] = reminderDateTime.split("T");
                    const newReminder = {
                      id: Date.now().toString(),
                      title: reminderTitle,
                      date,
                      time: time || "",
                    };
                    const updated = [...reminders, newReminder];
                    setReminders(updated);
                    localStorage.setItem("reminders", JSON.stringify(updated));
                    setReminderTitle("");
                    setReminderDateTime(getCurrentDateTimeLocal());
                    setReminderError(null);
                  }}
                  className="mb-4 space-y-2"
                >
                  <div>
                    <label htmlFor="reminder-title" className="block text-sm font-medium text-purple-800 mb-1">
                      Reminder Name
                    </label>
                    <input
                      id="reminder-title"
                      className="w-full border rounded px-3 py-2 bg-purple-50/50"
                      placeholder="Reminder title"
                      value={reminderTitle}
                      onChange={e => setReminderTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="reminder-date" className="block text-sm font-medium text-purple-800 mb-1">
                      Date & Time
                    </label>
                    <div className="flex gap-2 items-center">
                      <div>
                        <DayPicker
                          mode="single"
                          selected={reminderDateTime ? new Date(reminderDateTime.split("T")[0]) : undefined}
                          onDayClick={date => {
                            if (!date) return;
                            const d = date;
                            const year = d.getFullYear();
                            const month = String(d.getMonth() + 1).padStart(2, "0");
                            const day = String(d.getDate()).padStart(2, "0");
                            let time = "09:00";
                            if (reminderDateTime && reminderDateTime.includes("T")) {
                              time = reminderDateTime.split("T")[1];
                            }
                            setReminderDateTime(`${year}-${month}-${day}T${time}`);
                          }}
                          disabled={date => date < new Date(new Date().setHours(0,0,0,0))}
                        />
                      </div>
                      <select
                        className="border rounded px-2 py-2 bg-pink-50/50"
                        value={reminderDateTime && reminderDateTime.includes("T") ? reminderDateTime.split("T")[1] : "10:00"}
                        onChange={e => {
                          let date = reminderDateTime && reminderDateTime.includes("T")
                            ? reminderDateTime.split("T")[0]
                            : new Date().toISOString().slice(0, 10);
                          setReminderDateTime(`${date}T${e.target.value}`);
                        }}
                      >
                        {Array.from({ length: 24 * 4 }, (_, i) => {
                          const h = String(Math.floor(i / 4)).padStart(2, "0");
                          const m = String((i % 4) * 15).padStart(2, "0");
                          return (
                            <option key={h + m} value={`${h}:${m}`}>{`${h}:${m}`}</option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                  {reminderError && (
                    <div className="text-xs text-red-500">{reminderError}</div>
                  )}
                  <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-pink-500 hover:to-purple-600 text-white shadow-md">
                    Add Reminder
                  </Button>
                </form>
                <div>
                  <RemindersList
                    reminders={reminders}
                    setReminders={setReminders}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reminder Alert Modal */}
        {dueReminder && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
              <h3 className="text-lg font-semibold text-purple-800 mb-4">Reminder Alert</h3>
              <div className="mb-2 font-medium">{dueReminder.title}</div>
              <div className="mb-4 text-xs text-gray-500">
                {dueReminder.date} {dueReminder.time}
              </div>
              <div className="flex gap-3">
                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
                  onClick={() => {
                    // Remove the reminder
                    const updated = reminders.filter((r) => r.id !== dueReminder.id);
                    setReminders(updated);
                    localStorage.setItem("reminders", JSON.stringify(updated));
                    setDueReminder(null);
                  }}
                >
                  Close
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    // Snooze for 5 minutes
                    const snoozeDate = new Date(`${dueReminder.date}T${dueReminder.time}`);
                    snoozeDate.setMinutes(snoozeDate.getMinutes() + 5);
                    const pad = (n: number) => n.toString().padStart(2, "0");
                    const newDate = `${snoozeDate.getFullYear()}-${pad(snoozeDate.getMonth() + 1)}-${pad(snoozeDate.getDate())}`;
                    const newTime = `${pad(snoozeDate.getHours())}:${pad(snoozeDate.getMinutes())}`;
                    const updated = reminders.map((r) =>
                      r.id === dueReminder.id
                        ? { ...r, date: newDate, time: newTime }
                        : r
                    );
                    setReminders(updated);
                    localStorage.setItem("reminders", JSON.stringify(updated));
                    setDueReminder(null);
                  }}
                >
                  Snooze 5 min
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* EventForm modal removed */}

        {/* About App Dialog */}
        {activeView === "about" && <AboutAppSection onClose={() => setActiveView("menu")} />}
      </div>
    </div>
  );
}

// --- GoalTrackerSection component ---
type GoalType = "Daily" | "Weekly" | "Monthly";
interface Goal {
  id: string;
  type: GoalType;
  description: string;
  targetDate: string;
  status: "Pending" | "Completed";
}
const GOAL_TYPES: GoalType[] = ["Daily", "Weekly", "Monthly"];
const STATUS_OPTIONS = ["Pending", "Completed"];

const GoalTrackerSection: React.FC = () => {
  const [goals, setGoals] = React.useState<Goal[]>(() => {
    try {
      const saved = localStorage.getItem("goals");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [form, setForm] = React.useState<Omit<Goal, "id">>({
    type: "Daily",
    description: "",
    targetDate: "",
    status: "Pending",
  });
  const [editId, setEditId] = React.useState<string | null>(null);
  const [editForm, setEditForm] = React.useState<Omit<Goal, "id"> | null>(null);
  const [filterType, setFilterType] = React.useState<GoalType | "All">("All");

  React.useEffect(() => {
    localStorage.setItem("goals", JSON.stringify(goals));
  }, [goals]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!editForm) return;
    const { name, value } = e.target;
    setEditForm((prev) =>
      prev
        ? {
            ...prev,
            [name]: value,
          }
        : null
    );
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setGoals((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        ...form,
      },
    ]);
    setForm({
      type: "Daily",
      description: "",
      targetDate: "",
      status: "Pending",
    });
  };

  const handleEdit = (id: string) => {
    const goal = goals.find((g) => g.id === id);
    if (goal) {
      setEditId(id);
      setEditForm({
        type: goal.type,
        description: goal.description,
        targetDate: goal.targetDate,
        status: goal.status,
      });
    }
  };

  const handleEditSave = (id: string) => {
    if (!editForm) return;
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...editForm } : g))
    );
    setEditId(null);
    setEditForm(null);
  };

  const handleEditCancel = () => {
    setEditId(null);
    setEditForm(null);
  };

  const handleDelete = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    if (editId === id) {
      setEditId(null);
      setEditForm(null);
    }
  };

  const filteredGoals =
    filterType === "All"
      ? goals
      : goals.filter((g) => g.type === filterType);

  return (
    <div className="flex flex-col items-center min-h-[60vh] py-6 bg-gradient-to-br from-green-100 via-blue-50 to-indigo-50 rounded-xl">
      <div className="w-full max-w-2xl bg-white/90 rounded-2xl shadow-2xl p-6 border border-border overflow-hidden">
        <h2 className="text-2xl font-extrabold text-center text-green-800 mb-6">
          Goal Tracker
        </h2>
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          onSubmit={handleAdd}
        >
          <div>
            <label className="block font-semibold mb-1 text-green-900">
              Goal Type
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full border border-green-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-300 transition"
              required
            >
              {GOAL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-green-900">
              Target Date
            </label>
            <input
              type="date"
              name="targetDate"
              value={form.targetDate}
              onChange={handleChange}
              className="w-full border border-green-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-300 transition"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block font-semibold mb-1 text-green-900">
              Description
            </label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border border-green-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-300 transition"
              required
              placeholder="Describe your goal"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-green-900">
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border border-green-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-300 transition"
              required
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button
              type="submit"
              className="bg-gradient-to-r from-green-600 to-blue-400 text-white shadow-md hover:scale-105 transition w-full"
            >
              Add Goal
            </Button>
          </div>
        </form>
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="block font-semibold mb-1 text-green-900">
              Filter by Type
            </label>
            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value as GoalType | "All")
              }
              className="border border-green-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-300 transition"
            >
              <option value="All">All</option>
              {GOAL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
        <h3 className="text-xl font-bold mb-4 text-green-900">Goals</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 rounded-xl overflow-hidden shadow">
            <thead>
              <tr className="bg-gradient-to-r from-green-100 to-blue-100">
                <th className="p-3 border-b font-semibold text-green-900">
                  Type
                </th>
                <th className="p-3 border-b font-semibold text-green-900">
                  Description
                </th>
                <th className="p-3 border-b font-semibold text-green-900">
                  Target Date
                </th>
                <th className="p-3 border-b font-semibold text-green-900">
                  Status
                </th>
                <th className="p-3 border-b font-semibold text-green-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredGoals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No goals found.
                  </td>
                </tr>
              ) : (
                filteredGoals.map((goal) => {
                  const isEditing = editId === goal.id && editForm;
                  if (isEditing) {
                    return (
                      <tr key={goal.id} className="bg-yellow-50">
                        <td className="p-2 border-b">
                          <select
                            name="type"
                            value={editForm.type}
                            onChange={handleEditChange}
                            className="w-full"
                          >
                            {GOAL_TYPES.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2 border-b">
                          <input
                            name="description"
                            value={editForm.description}
                            onChange={handleEditChange}
                            className="w-full"
                          />
                        </td>
                        <td className="p-2 border-b">
                          <input
                            type="date"
                            name="targetDate"
                            value={editForm.targetDate}
                            onChange={handleEditChange}
                            className="w-full"
                          />
                        </td>
                        <td className="p-2 border-b">
                          <select
                            name="status"
                            value={editForm.status}
                            onChange={handleEditChange}
                            className="w-full"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2 border-b">
                          <Button
                            size="sm"
                            variant="default"
                            className="mr-2"
                            onClick={() => handleEditSave(goal.id)}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleEditCancel}
                          >
                            Cancel
                          </Button>
                        </td>
                      </tr>
                    );
                  }
                  return (
                    <tr key={goal.id} className="bg-white even:bg-green-50">
                      <td className="p-2 border-b">{goal.type}</td>
                      <td className="p-2 border-b">{goal.description}</td>
                      <td className="p-2 border-b">{goal.targetDate}</td>
                      <td className="p-2 border-b">{goal.status}</td>
                      <td className="p-2 border-b">
                        <Button
                          size="sm"
                          variant="outline"
                          className="mr-2"
                          onClick={() => handleEdit(goal.id)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(goal.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/**
 * RemindersList: paginated, editable reminder names
 */
const RemindersList: React.FC<{
  reminders: { id: string; title: string; date: string; time: string }[];
  setReminders: React.Dispatch<React.SetStateAction<{ id: string; title: string; date: string; time: string }[]>>;
}> = ({ reminders, setReminders }) => {
  const [editId, setEditId] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState<string>("");
  const [page, setPage] = React.useState(0);

  const pageSize = 5;
  const totalPages = Math.ceil(reminders.length / pageSize);
  const paginated = reminders.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <div>
      {reminders.length === 0 ? (
        <div className="text-gray-500 text-sm">No reminders set.</div>
      ) : (
        <>
          <ul className="space-y-2">
            {paginated.map(r => (
              <li key={r.id} className="flex items-center justify-between border-b pb-1">
                <div>
                  {editId === r.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        className="border rounded px-2 py-1 text-sm"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="default"
                        className="px-2"
                        onClick={() => {
                          setReminders(prev =>
                            prev.map(rem =>
                              rem.id === r.id ? { ...rem, title: editValue } : rem
                            )
                          );
                          setEditId(null);
                          setEditValue("");
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="px-2"
                        onClick={() => {
                          setEditId(null);
                          setEditValue("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="font-medium">{r.title}</div>
                      <div className="text-xs text-gray-500">
                        {r.date} {r.time}
                      </div>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="px-2"
                    onClick={() => {
                      setEditId(r.id);
                      setEditValue(r.title);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 px-2 py-1"
                    onClick={() => {
                      const updated = reminders.filter(rem => rem.id !== r.id);
                      setReminders(updated);
                      localStorage.setItem("reminders", JSON.stringify(updated));
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex justify-between items-center mt-2">
            <Button
              size="sm"
              variant="outline"
              className="px-2"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <span className="text-xs text-gray-700">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              className="px-2"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

/** AboutAppSection: About modal with changelog button and modal */
const AboutAppSection: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [showChangelog, setShowChangelog] = React.useState(false);
  const version = import.meta.env.VITE_APP_VERSION;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-400 to-indigo-400 opacity-90"></div>
        {/* Content card */}
        <div className="relative z-10 p-0">
          {/* Header bar */}
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-700 to-cyan-500">
            <h3 className="text-2xl font-bold text-white drop-shadow">About This App</h3>
            <button
              className="text-white text-2xl font-bold hover:text-cyan-200 transition"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="px-6 py-6 bg-white/90 rounded-b-2xl">
            <div className="mb-4">
              <span className="font-semibold text-gray-700">Version:</span>
              <span className="ml-2 text-blue-700 font-mono">{version}</span>
              <Button
                className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 border border-blue-200 rounded hover:bg-blue-200"
                onClick={() => setShowChangelog(true)}
              >
                Show Changelog
              </Button>
              {showChangelog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
                  <div className="relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden bg-white">
                    <div className="flex justify-between items-center p-4 border-b">
                      <h3 className="text-lg font-bold text-blue-900">Changelog</h3>
                      <Button
                        onClick={() => setShowChangelog(false)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Close
                      </Button>
                    </div>
                    <div className="p-4 max-h-[60vh] overflow-y-auto text-sm">
                      <ul className="list-disc pl-5 space-y-2">
                        <li>
                          <span className="font-semibold">v1.2</span>
                          <span className="text-xs text-gray-500 ml-2">(2025-06-07)</span>:
                          Goal Tracker, AI Assistant, and Inspiration screens now use modal popups. About screen version is dynamic. Changelog modal added.
                        </li>
                        <li>
                          <span className="font-semibold">v1.1</span>
                          <span className="text-xs text-gray-500 ml-2">(2025-05-20)</span>:
                          Added Personal Reminders, improved Attendance and Profile screens, and made UI lighter.
                        </li>
                        <li>
                          <span className="font-semibold">v1.0</span>
                          <span className="text-xs text-gray-500 ml-2">(2025-05-01)</span>:
                          Initial release with Dashboard, CSR Events, Attendance, Profile, and basic features.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <span className="font-semibold text-gray-700">Tech Stack:</span>
              <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1 text-sm">
                <li>React (TypeScript)</li>
                <li>Vite</li>
                <li>Tailwind CSS</li>
                <li>shadcn/ui & Radix UI</li>
                <li>Dexie (IndexedDB)</li>
                <li>React Hook Form & Zod</li>
                <li>date-fns, react-day-picker</li>
                <li>Lucide Icons</li>
                <li>Recharts</li>
                <li>PostCSS, ESLint, Prettier</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

// --- Inspiration Section ---
const InspirationSection: React.FC = () => {
  const quotes = [
    "The best way to get started is to quit talking and begin doing. – Walt Disney",
    "Success is not in what you have, but who you are. – Bo Bennett",
    "Don’t let yesterday take up too much of today. – Will Rogers",
    "It’s not whether you get knocked down, it’s whether you get up. – Vince Lombardi",
    "If you are working on something exciting, it will keep you motivated. – Steve Jobs",
    "The harder you work for something, the greater you’ll feel when you achieve it.",
    "Dream bigger. Do bigger.",
    "Don’t watch the clock; do what it does. Keep going. – Sam Levenson",
    "Great things never come from comfort zones.",
    "Push yourself, because no one else is going to do it for you.",
    "Success doesn’t just find you. You have to go out and get it.",
    "The only limit to our realization of tomorrow is our doubts of today. – F.D. Roosevelt",
    "Small steps in the right direction can turn out to be the biggest step of your life.",
    "You don’t have to be great to start, but you have to start to be great. – Zig Ziglar",
    "Stay positive, work hard, make it happen."
  ];
  const [quote, setQuote] = React.useState(() => {
    // Show a new quote each day based on date
    const day = new Date().getDate();
    return quotes[day % quotes.length];
  });

  const handleNewQuote = () => {
    let newQuote = quote;
    while (newQuote === quote) {
      newQuote = quotes[Math.floor(Math.random() * quotes.length)];
    }
    setQuote(newQuote);
  };

  return (
    <div className="flex flex-col items-center min-h-[40vh] py-6 bg-gradient-to-br from-orange-100 via-yellow-50 to-indigo-50 rounded-xl">
      <div className="w-full max-w-xl bg-white/90 rounded-2xl shadow-2xl p-8 border border-border overflow-hidden flex flex-col items-center">
        <h2 className="text-2xl font-extrabold text-center text-orange-800 mb-6">
          Inspiration of the Day
        </h2>
        <div className="text-xl text-orange-900 font-semibold text-center mb-6">
          “{quote}”
        </div>
        <Button onClick={handleNewQuote} className="bg-orange-500 text-white">
          Show Another
        </Button>
      </div>
    </div>
  );
};
