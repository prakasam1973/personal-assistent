import Dexie, { Table } from "dexie";

export type MomNoteStatus = "open" | "completed" | "closed";

export interface MomNote {
  id: string;
  date: string; // ISO date string
  content: string; // HTML from rich text editor
  status: MomNoteStatus;
}

class MomNotesDB extends Dexie {
  momNotes!: Table<MomNote, string>;

  constructor() {
    super("MomNotesDB");
    this.version(1).stores({
      momNotes: "id,date,status"
    });
  }
}

/**
 * Clears all mom notes from the database.
 */
export const clearMomNotes = async (): Promise<void> => {
  try {
    await momNotesDb.momNotes.clear();
  } catch (error) {
    console.error('Failed to clear mom notes from IndexedDB:', error);
  }
};
export const momNotesDb = new MomNotesDB();