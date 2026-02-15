"use client";

/**
 * Dashboard notes area: Add/edit in modals; new note stays on first page and opens in edit modal (same transition as edit).
 */
import { useState, useEffect } from "react";
import { NoteCard } from "@/components/NoteCard";
import { NoteEditorModal } from "@/components/NoteEditorModal";
import { AddNoteModal } from "@/components/AddNoteModal";
import type { Note } from "@/lib/api";

const PENDING_NOTE_KEY = "pendingNewNote";

export function DashboardContent({ initialNotes }: { initialNotes: Note[] }) {
  const [notes, setNotes] = useState(initialNotes);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = sessionStorage.getItem(PENDING_NOTE_KEY);
    if (!raw) return;
    sessionStorage.removeItem(PENDING_NOTE_KEY);
    let note: Note;
    try {
      note = JSON.parse(raw) as Note;
    } catch {
      return;
    }
    setNotes((prev) =>
      prev.some((n) => n.id === note.id) ? prev : [note, ...prev]
    );
  }, []);

  function handleSaved(updatedNote: Note) {
    setNotes((prev) =>
      prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
    );
  }

  function handleAdded(note: Note) {
    setNotes((prev) => [note, ...prev]);
  }

  return (
    <>
      {/* Take a note bar */}
      <button
        type="button"
        onClick={() => setAddModalOpen(true)}
        className="flex items-center w-full max-w-2xl mx-auto mb-6 bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow px-4 py-3 text-stone-500 text-left"
      >
        <span className="text-sm">Take a note…</span>
      </button>

      {/* Notes grid or empty state */}
      {notes.length === 0 ? (
        <div className="text-center py-12 text-stone-500">
          <p className="mb-2">No notes yet.</p>
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="text-amber-600 hover:text-amber-700 font-medium"
          >
            Create your first note
          </button>
        </div>
      ) : (
        <ul
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 list-none p-0 m-0"
          role="list"
        >
          {notes.map((note) => (
            <li key={note.id}>
              <NoteCard note={note} onSelect={setSelectedNote} />
            </li>
          ))}
        </ul>
      )}

      {/* FAB */}
      <button
        type="button"
        onClick={() => setAddModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-amber-400 hover:bg-amber-500 shadow-lg flex items-center justify-center text-stone-800 font-medium text-2xl leading-none"
        aria-label="Add note"
      >
        +
      </button>

      {selectedNote && (
        <NoteEditorModal
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
          onSaved={handleSaved}
        />
      )}

      {addModalOpen && (
        <AddNoteModal
          onClose={() => setAddModalOpen(false)}
          onAdded={handleAdded}
        />
      )}
    </>
  );
}
