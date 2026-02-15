"use client";

/**
 * Edit note form. Submits to server action, redirects to note view on success. (NOTES-08)
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { updateNoteAction } from "./actions";
import type { Note } from "@/lib/api";

export function EditNoteForm({ note }: { note: Note }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submittingRef.current) return;
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const body = (formData.get("body") as string)?.trim();
    const title = (formData.get("title") as string)?.trim() || null;

    if (!body) {
      setError("Body is required.");
      return;
    }

    submittingRef.current = true;
    setLoading(true);
    const result = await updateNoteAction(note.id, { body, title });
    setLoading(false);
    submittingRef.current = false;

    if (result.success) {
      router.push(`/notes/${note.id}`);
      return;
    }
    setError(result.error);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="edit-title" className="sr-only">
          Title (optional)
        </label>
        <input
          ref={titleRef}
          id="edit-title"
          name="title"
          type="text"
          defaultValue={note.title ?? ""}
          className="note-title-input w-full border-0 border-b border-stone-200 focus:border-amber-400 focus:ring-0 py-2 pr-0 text-stone-900 placeholder:text-stone-400"
          placeholder="Title"
        />
      </div>
      <div>
        <label htmlFor="edit-body" className="sr-only">
          Body (required)
        </label>
        <textarea
          id="edit-body"
          name="body"
          required
          rows={8}
          defaultValue={note.body}
          className="note-body-textarea w-full border-0 focus:ring-0 py-2 text-stone-900 placeholder:text-stone-400 resize-none"
          placeholder="Take a note…"
        />
      </div>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-stone-900 rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save"}
        </button>
        <Link
          href={`/notes/${note.id}`}
          className="px-4 py-2 text-stone-500 hover:text-stone-700 self-center text-sm"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
