"use client";

/**
 * Add note form. On success redirects to dashboard; new note appears in list and opens in edit modal (same as add-from-dashboard).
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createNoteAction } from "./actions";

const PENDING_NOTE_KEY = "pendingNewNote";

export function AddNoteForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    const result = await createNoteAction({ body, title });
    setLoading(false);

    if (result.success) {
      sessionStorage.setItem(PENDING_NOTE_KEY, JSON.stringify(result.note));
      router.push("/dashboard");
      return;
    }
    setError(result.error);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="sr-only">
          Title (optional)
        </label>
        <input
          id="title"
          name="title"
          type="text"
          className="w-full border-0 border-b border-stone-200 focus:border-amber-400 focus:ring-0 px-0 py-2 text-stone-900 placeholder:text-stone-400"
          placeholder="Title"
        />
      </div>
      <div>
        <label htmlFor="body" className="sr-only">
          Body (required)
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={6}
          className="w-full border-0 focus:ring-0 px-0 py-2 text-stone-900 placeholder:text-stone-400 resize-none"
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
          {loading ? "Creating…" : "Save"}
        </button>
        <Link
          href="/dashboard"
          className="px-4 py-2 text-stone-500 hover:text-stone-700 self-center text-sm"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
