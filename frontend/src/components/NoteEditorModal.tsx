"use client";

/**
 * Keep-style overlay: open a note in an editable modal. Save updates via server action and closes; onSaved(updatedNote) for local UI update.
 */
import { useState, useEffect } from "react";
import { updateNoteAction } from "@/app/notes/[id]/edit/actions";
import type { Note } from "@/lib/api";

type Props = {
  note: Note;
  onClose: () => void;
  onSaved?: (updatedNote: Note) => void;
};

export function NoteEditorModal({ note, onClose, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const body = (formData.get("body") as string)?.trim();
    const title = (formData.get("title") as string)?.trim() || null;

    if (!body) {
      setError("Body is required.");
      return;
    }

    setLoading(true);
    const result = await updateNoteAction(note.id, { body, title });
    setLoading(false);

    if (result.success) {
      onSaved?.(result.note);
      onClose();
      return;
    }
    setError(result.error);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-label="Edit note"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl border border-stone-200 shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 min-h-0 p-5"
        >
          <div className="flex-1 overflow-auto space-y-3">
            <input
              name="title"
              type="text"
              defaultValue={note.title ?? ""}
              className="w-full border-0 border-b border-stone-200 focus:border-amber-400 focus:ring-0 px-0 py-2 text-stone-900 placeholder:text-stone-400 text-lg font-medium"
              placeholder="Title"
            />
            <textarea
              name="body"
              required
              rows={10}
              defaultValue={note.body}
              className="w-full border-0 focus:ring-0 px-0 py-2 text-stone-900 placeholder:text-stone-400 resize-none min-h-[200px]"
              placeholder="Take a note…"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 mt-2" role="alert">
              {error}
            </p>
          )}
          <div className="flex gap-3 pt-4 mt-4 border-t border-stone-200">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-stone-900 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-500 hover:text-stone-700 text-sm"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
