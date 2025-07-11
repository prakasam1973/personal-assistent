// To enable advanced rich text editing, install react-quill:
// npm install react-quill
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

type Note = {
  id: string;
  title: string;
  content: string;
};

const LOCAL_STORAGE_KEY = "dashboard-notepad-notes";

const NotepadModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const NOTES_PER_PAGE = 5;
  const contentRef = useRef<HTMLDivElement>(null);

  // Helper to run execCommand and focus the editor
  const runCommand = (cmd: string) => {
    if (contentRef.current) {
      contentRef.current.focus();
      document.execCommand(cmd, false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) setNotes(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return;
    if (editingId) {
      setNotes(notes =>
        notes.map(n =>
          n.id === editingId ? { ...n, title, content } : n
        )
      );
    } else {
      setNotes(notes => [
        { id: Date.now().toString(), title: title.trim() || "Untitled", content },
        ...notes,
      ]);
    }
    setEditingId(null);
    setTitle("");
    setContent("");
  };

  const handleEdit = (note: Note) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      setNotes(notes => notes.filter(n => n.id !== deleteId));
      if (editingId === deleteId) {
        setEditingId(null);
        setTitle("");
        setContent("");
      }
      setDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="relative w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden bg-white max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-2xl font-bold text-blue-900">Notepad</h2>
          <button
            className="text-2xl font-bold text-gray-500 hover:text-pink-600 transition"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="p-4">
          <div className="mb-4 flex flex-col gap-2">
            <label className="font-semibold text-blue-900 mb-1" htmlFor="notepad-title">
              Notes Title <span className="text-red-600">*</span>
            </label>
            <input
              id="notepad-title"
              className="border rounded px-3 py-2 text-lg"
              placeholder="Note title"
              value={title}
              onChange={e => {
                setTitle(e.target.value);
                // Validate for duplicates
                const trimmed = e.target.value.trim().toLowerCase();
                const duplicate = notes.some(
                  n =>
                    n.title.trim().toLowerCase() === trimmed &&
                    n.id !== editingId
                );
                setTitleError(duplicate ? "A note with this title already exists." : null);
              }}
              required
            />
            {titleError && (
              <div className="text-red-600 text-xs mt-1">{titleError}</div>
            )}
            <label className="font-semibold text-blue-900 mb-1 mt-2" htmlFor="notepad-content">
              Notes <span className="text-red-600">*</span>
            </label>
            {/* Advanced Rich Text Editor */}
            <div className="mb-2">
              <ReactQuill
                value={content}
                onChange={setContent}
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'indent': '-1'}, { 'indent': '+1' }],
                    ['blockquote', 'code-block'],
                    ['link', 'image'],
                    [{ 'align': [] }],
                    ['clean'],
                  ]
                }}
                formats={[
                  'header', 'bold', 'italic', 'underline', 'strike',
                  'list', 'bullet', 'indent', 'blockquote', 'code-block',
                  'link', 'image', 'align'
                ]}
                className="min-h-[180px] bg-white"
                style={{ direction: "ltr", textAlign: "left", height: "50vh" }}
                aria-required="true"
                placeholder="Write your note here..."
              />
              <style>
                {`
                  .ql-container {
                    min-height: 40vh !important;
                    height: 40vh !important;
                    overflow-y: scroll !important;
                  }
                  .ql-editor {
                    height: 100% !important;
                    overflow-y: scroll !important;
                  }
                `}
              </style>
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                onClick={handleSave}
                className="bg-blue-600 text-white"
                disabled={!title.trim() || !content || content === "<br>" || !!titleError}
              >
                {editingId ? "Update Note" : "Add Note"}
              </Button>
              {editingId && (
                <Button onClick={handleCancel} variant="outline">
                  Cancel
                </Button>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-blue-900">Your Notes</h3>
            {notes.length === 0 ? (
              <div className="text-gray-500">No notes yet.</div>
            ) : (
              <>
                <div className="mb-2 flex items-center gap-2">
                  <input
                    type="text"
                    className="border rounded px-3 py-1 text-sm w-full max-w-xs"
                    placeholder="Search notes by title..."
                    value={search}
                    onChange={e => {
                      setSearch(e.target.value);
                      setPage(0);
                    }}
                  />
                </div>
                <ul className="space-y-3">
                  {notes
                    .filter(note =>
                      note.title.toLowerCase().includes(search.trim().toLowerCase())
                    )
                    .slice(page * NOTES_PER_PAGE, (page + 1) * NOTES_PER_PAGE)
                    .map(note => (
                      <li key={note.id} className="border rounded p-3 flex flex-col bg-blue-50">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-blue-800">{note.title}</span>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(note)}>
                              Edit
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(note.id)}>
                              Delete
                            </Button>
                          </div>
                        </div>
                        {/* Only show the title, not the content */}
                      </li>
                    ))}
                </ul>
                <div className="flex justify-between items-center mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    Previous
                  </Button>
                  <span className="text-xs text-gray-700">
                    Page {page + 1} of {Math.max(1, Math.ceil(notes.filter(note =>
                      note.title.toLowerCase().includes(search.trim().toLowerCase())
                    ).length / NOTES_PER_PAGE))}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage(p => Math.min(Math.ceil(notes.filter(note =>
                      note.title.toLowerCase().includes(search.trim().toLowerCase())
                    ).length / NOTES_PER_PAGE) - 1, p + 1))}
                    disabled={page >= Math.ceil(notes.filter(note =>
                      note.title.toLowerCase().includes(search.trim().toLowerCase())
                    ).length / NOTES_PER_PAGE) - 1}
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Delete confirmation dialog */}
      {deleteId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2 text-red-700">Delete Note</h3>
            <p className="mb-4 text-gray-700">Are you sure you want to delete this note? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={cancelDelete}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotepadModal;