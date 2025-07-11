import React, { useEffect, useState } from "react";
import { momNotesDb, MomNote, MomNoteStatus } from "@/utils/momNotesDb";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

const statusOptions: MomNoteStatus[] = ["open", "completed", "closed"];

import { useNavigate } from "react-router-dom";

const MomNotesList = () => {
  const [notes, setNotes] = useState<MomNote[]>([]);
  const [newDate, setNewDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [newContent, setNewContent] = useState("");
  const [newActionItem, setNewActionItem] = useState("");
  const [adding, setAdding] = useState(false);
  const [addErrors, setAddErrors] = useState<{ date?: string; content?: string; actionItem?: string }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const notesPerPage = 5;
  const navigate = useNavigate();

  // For delete confirmation dialog
  const [noteToDelete, setNoteToDelete] = useState<MomNote | null>(null);

  // For editing notes
  const [noteToEdit, setNoteToEdit] = useState<MomNote | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  // Status filter
  const [statusFilter, setStatusFilter] = useState<"all" | MomNoteStatus>("all");

  // Fetch notes from DB
  useEffect(() => {
    const fetchNotes = async () => {
      const all = await momNotesDb.momNotes.orderBy("date").reverse().toArray();
      setNotes(all);
    };
    fetchNotes();
  }, []);

  // Add new note
  const handleAdd = async () => {
    const errors: { date?: string; content?: string; actionItem?: string } = {};
    if (!newDate || !newDate.trim()) errors.date = "Date is required.";
    if (!newContent || !newContent.trim()) errors.content = "Notes are required.";
    if (!newActionItem || !newActionItem.trim()) errors.actionItem = "Action Item is required.";
    setAddErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const note: MomNote & { actionItem?: string } = {
      id: Date.now().toString(),
      date: newDate,
      content: newContent,
      status: "open",
      actionItem: newActionItem,
    };
    await momNotesDb.momNotes.add(note);
    setNotes([note, ...notes]);
    setNewContent("");
    setNewActionItem("");
    setNewDate(new Date().toISOString().slice(0, 10));
    setAdding(false);
    setCurrentPage(1); // Go to first page after adding
    setAddErrors({});
  };

  // Delete note (called after confirmation)
  const handleDelete = async (id: string) => {
    await momNotesDb.momNotes.delete(id);
    const updatedNotes = notes.filter(n => n.id !== id);
    setNotes(updatedNotes);
    // If last note on page deleted, go to previous page if needed
    const lastPage = Math.max(1, Math.ceil(updatedNotes.length / notesPerPage));
    if (currentPage > lastPage) setCurrentPage(lastPage);
  };

  // Change status
  const handleStatus = async (id: string, status: MomNoteStatus) => {
    await momNotesDb.momNotes.update(id, { status });
    setNotes(notes.map(n => n.id === id ? { ...n, status } : n));
  };

  // Edit note
  const handleEdit = (note: MomNote) => {
    setNoteToEdit(note);
    setEditContent(note.content);
    setEditError(null);
  };

  const handleEditSave = async () => {
    // Use DOMParser to extract plain text from HTML
    let plainText = "";
    if (typeof window !== "undefined" && window.DOMParser) {
      const parser = new window.DOMParser();
      const doc = parser.parseFromString(editContent, "text/html");
      // Remove all whitespace, newlines, and non-breaking spaces
      plainText = (doc.body.textContent || "")
        .replace(/[\u00A0\s\r\n]+/g, "")
        .replace(/&nbsp;/g, "");
    } else {
      plainText = editContent.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '').replace(/[\s\r\n]+/g, "");
    }
    if (!plainText || plainText.length === 0) {
      setEditError("Notes are required.");
      return;
    }
    if (noteToEdit) {
      await momNotesDb.momNotes.update(noteToEdit.id, { content: editContent });
      setNotes(notes.map(n => n.id === noteToEdit.id ? { ...n, content: editContent } : n));
      setNoteToEdit(null);
      setEditContent("");
      setEditError(null);
    }
  };

  const handleEditCancel = () => {
    setNoteToEdit(null);
    setEditContent("");
    setEditError(null);
  };

  // Filter notes by status
  const filteredNotes =
    statusFilter === "all"
      ? notes
      : notes.filter((n) => n.status === statusFilter);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredNotes.length / notesPerPage));
  const paginatedNotes = filteredNotes.slice(
    (currentPage - 1) * notesPerPage,
    currentPage * notesPerPage
  );

  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const handlePageClick = (page: number) => setCurrentPage(page);

  return (
    <div
      className="flex flex-col items-center min-h-[80vh] py-10 bg-gradient-to-br from-blue-100 via-cyan-100 to-pink-100"
      style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}
    >
      <div className="w-full max-w-5xl bg-white/90 rounded-2xl shadow-2xl p-0 border border-border overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-8 py-6 bg-gradient-to-r from-blue-400 to-pink-300">
          <h2 className="text-3xl font-extrabold text-white drop-shadow tracking-tight flex-1">My Todo Items</h2>
          {/* Back button removed */}
        </div>
        <div className="p-8">
        <div className="mb-8 flex flex-wrap gap-4 items-center justify-between">
          {/* Status Filter */}
          <div>
            <label htmlFor="status-filter" className="mr-2 font-semibold text-blue-900">
              Filter by Status:
            </label>
            <select
              id="status-filter"
              className="border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 transition"
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value as "all" | MomNoteStatus);
                setCurrentPage(1);
              }}
            >
              <option value="all">All</option>
              {statusOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <Button
            className="bg-gradient-to-r from-blue-700 to-cyan-500 text-white shadow-md hover:scale-105 transition flex items-center gap-2 px-5 py-2 rounded-lg font-semibold"
            onClick={() => setAdding(a => !a)}
          >
            {adding ? (
              "Cancel"
            ) : (
              <>
                <span className="text-xl font-bold">+</span>
                <span>New Note</span>
              </>
            )}
          </Button>
        </div>
        {adding && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 border border-border relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                onClick={() => setAdding(false)}
                aria-label="Close"
              >
                ×
              </button>
              <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                <span className="text-2xl font-bold">+</span>
                Add Note
              </h3>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1" htmlFor="meeting-date">
                  Date
                </label>
                <div className="flex gap-2 items-center relative">
                  <input
                    id="meeting-date"
                    type="date"
                    className="w-full border rounded px-3 py-2"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    required
                    autoComplete="off"
                    spellCheck={false}
                    inputMode="text"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="px-2 py-1"
                    onClick={() => setShowDatePicker((v) => !v)}
                  >
                    📅
                  </Button>
                  {showDatePicker && (
                    <div className="absolute z-50 top-full left-0 mt-2 bg-white border rounded shadow-lg">
                      <DayPicker
                        mode="single"
                        selected={newDate ? new Date(newDate) : undefined}
                        onDayClick={(date) => {
                          setNewDate(date.toISOString().slice(0, 10));
                          setShowDatePicker(false);
                        }}
                      />
                      <div className="text-xs text-gray-500 px-2 pb-2">Click a date to select</div>
                    </div>
                  )}
                </div>
                {addErrors.date && (
                  <div className="text-xs text-red-500 mt-1">{addErrors.date}</div>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1" htmlFor="action-item">
                  Action Item
                </label>
                <input
                  id="action-item"
                  className="w-full border rounded px-3 py-2"
                  placeholder="Action Item"
                  value={newActionItem}
                  onChange={e => setNewActionItem(e.target.value)}
                />
                {addErrors.actionItem && (
                  <div className="text-xs text-red-500 mt-1">{addErrors.actionItem}</div>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1" htmlFor="Minutes of Meeting-notes">
                  Notes
                </label>
                <ReactQuill
                  id="Minutes of Meeting-notes"
                  value={newContent}
                  onChange={setNewContent}
                  theme="snow"
                  className="bg-white"
                />
                {addErrors.content && (
                  <div className="text-xs text-red-500 mt-1">{addErrors.content}</div>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white flex-1" onClick={handleAdd}>
                  Save
                </Button>
                <Button variant="outline" onClick={() => setAdding(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
        <div>
          {filteredNotes.length === 0 ? (
            <div className="text-center text-gray-500">No notes found.</div>
          ) : (
            <table className="w-full border-separate border-spacing-0 rounded-xl overflow-hidden shadow">
              <thead>
                <tr className="bg-gradient-to-r from-blue-100 to-cyan-100">
                  <th className="p-3 border-b font-semibold text-blue-900">Date</th>
                  <th className="p-3 border-b font-semibold text-blue-900">Action Item</th>
                  <th className="p-3 border-b font-semibold text-blue-900">Notes</th>
                  <th className="p-3 border-b font-semibold text-blue-900">Status</th>
                  <th className="p-3 border-b font-semibold text-blue-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedNotes.map(note => (
                  <tr key={note.id} className="align-top hover:bg-blue-50 transition">
                    <td className="p-3 border-b whitespace-nowrap">{note.date}</td>
                    <td className="p-3 border-b">{(note as any).actionItem || "-"}</td>
                    <td className="p-3 border-b" dangerouslySetInnerHTML={{ __html: note.content }} />
                    <td className="p-3 border-b">
                      <select
                        value={note.status}
                        onChange={e => handleStatus(note.id, e.target.value as MomNoteStatus)}
                        className="border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 transition"
                      >
                        {statusOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 border-b flex gap-2">
                      <Button
                        variant="outline"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => handleEdit(note)}
                      >
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => setNoteToDelete(note)}
                          >
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Note</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this note? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              onClick={() => setNoteToDelete(null)}
                            >
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={async () => {
                                if (noteToDelete) {
                                  await handleDelete(noteToDelete.id);
                                  setNoteToDelete(null);
                                }
                              }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                className="px-3"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                Prev
              </Button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
                  onClick={() => handlePageClick(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <Button
                variant="outline"
                className="px-3"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* Edit Note Modal */}
      {noteToEdit ? (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={handleEditCancel}
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Minutes of Meeting Note</h3>
            <ReactQuill
              value={editContent}
              onChange={setEditContent}
              theme="snow"
              className="bg-white mb-4"
            />
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleEditSave}
                className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                disabled={
                  (() => {
                    let plainText = "";
                    if (typeof window !== "undefined" && window.DOMParser) {
                      const parser = new window.DOMParser();
                      const doc = parser.parseFromString(editContent, "text/html");
                      plainText = (doc.body.textContent || "")
                        .replace(/[\u00A0\s\r\n]+/g, "")
                        .replace(/&nbsp;/g, "");
                    } else {
                      plainText = editContent.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '').replace(/[\s\r\n]+/g, "");
                    }
                    return !plainText || plainText.length === 0;
                  })()
                }
              >
                Save
              </Button>
              <Button variant="outline" onClick={handleEditCancel} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
      </div>
);
};

export default MomNotesList;