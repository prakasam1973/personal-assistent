import Dexie, { Table } from 'dexie';
import { DailyEvent } from '@/types/daily';

class EventsDB extends Dexie {
  events!: Table<DailyEvent, number>;

  constructor() {
    super('EventsDB');
    this.version(1).stores({
      events: '++id,date,title,description' // Add other fields as needed
    });
  }
}

const db = new EventsDB();

export const saveEvents = async (events: DailyEvent[]): Promise<void> => {
  try {
    await db.events.clear();
    await db.events.bulkAdd(events);
  } catch (error) {
    console.error('Failed to save events to IndexedDB:', error);
  }
};

export const loadEvents = async (): Promise<DailyEvent[]> => {
  try {
    const events = await db.events.toArray();
    // Convert date strings back to Date objects if needed
    return events.map((event: any) => ({
      ...event,
      date: new Date(event.date)
    }));
  } catch (error) {
    console.error('Failed to load events from IndexedDB:', error);
    return [];
  }
};

export const clearEvents = async (): Promise<void> => {
  try {
    await db.events.clear();
  } catch (error) {
    console.error('Failed to clear events from IndexedDB:', error);
  }
};
