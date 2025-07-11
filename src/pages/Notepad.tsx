import React, { useState, useEffect } from "react";

const LOCAL_STORAGE_KEY = "dashboard-notepad-content";

const Notepad: React.FC = () => {
  const [content, setContent] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved !== null) setContent(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, content);
  }, [content]);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4 text-blue-900">Dashboard Notepad</h1>
      <textarea
        className="w-full min-h-[400px] rounded-lg border border-blue-200 p-4 text-lg shadow focus:ring-2 focus:ring-blue-400 transition"
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Type your notes here..."
        spellCheck={true}
      />
      <div className="text-right text-xs text-gray-400 mt-2">
        Notes are saved automatically in your browser.
      </div>
    </div>
  );
};

export default Notepad;