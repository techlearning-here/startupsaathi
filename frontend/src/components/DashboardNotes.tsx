"use client";

/**
 * Notes grid with Keep-style inline edit. Holds notes in state so only the edited note is updated on save (no full refresh).
 */
import { useState } from "react";
import { NoteCard } from "@/components/NoteCard";
import { NoteEditorModal } from "@/components/NoteEditorModal";
import type { Note } from "@/lib/api";

export function DashboardNotes({ notes: initialNotes }: { notes: Note[] }) {
  const [notes, setNotes] = useState(initialNotes);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  function handleSaved(updatedNote: Note) {
    setNotes((prev) =>
      prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
    );
  }

  return (
    <>
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
      {selectedNote && (
        <NoteEditorModal
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
