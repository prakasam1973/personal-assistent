import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const MomNotes = () => {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const navigate = useNavigate();

  const handleSave = () => {
    // Placeholder: Save logic can be added here (localStorage, Dexie, etc.)
    alert("Notes saved!\n\nDate: " + date + "\nNotes: " + notes);
    setNotes("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-white">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center font-segoe">Track Minutes of Meeting</h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-segoe" htmlFor="mom-date">
            Date
          </label>
          <input
            id="mom-date"
            type="date"
            className="w-full border rounded px-3 py-2 font-segoe"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-segoe" htmlFor="mom-notes">
            Notes
          </label>
          <textarea
            id="mom-notes"
            className="w-full border rounded px-3 py-2 font-segoe"
            rows={6}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Write your notes here..."
          />
        </div>
        <div className="flex gap-4">
          <Button className="bg-blue-600 hover:bg-blue-700 flex-1 font-segoe" onClick={handleSave}>
            Save
          </Button>
          <Button variant="outline" className="flex-1 font-segoe" onClick={() => navigate(-1)}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MomNotes;