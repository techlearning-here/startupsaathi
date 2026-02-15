"use client";

/**
 * Keep-style note card. Optional delete icon on card; onSelect opens modal or Link to note page.
 */
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { deleteNote } from "@/lib/api";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { Note } from "@/lib/api";

const BODY_SNIPPET_LENGTH = 150;

function noteSnippet(body: string): string {
  const trimmed = body.trim();
  if (trimmed.length <= BODY_SNIPPET_LENGTH) return trimmed;
  return trimmed.slice(0, BODY_SNIPPET_LENGTH) + "…";
}

const cardBaseClassName =
  "bg-amber-50 rounded-xl border border-amber-200/60 shadow-sm hover:shadow-md transition-shadow p-4 h-full min-h-[140px] flex flex-col text-left w-full";

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

export function NoteCard({
  note,
  onSelect,
  onDeleted,
}: {
  note: Note;
  onSelect?: (note: Note) => void;
  onDeleted?: (noteId: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const title = note.title?.trim() || "Untitled";
  const snippet = noteSnippet(note.body);

  function openDeleteConfirm(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!onDeleted) return;
    setShowDeleteConfirm(true);
  }

  async function handleConfirmDelete() {
    if (!onDeleted) return;
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setShowDeleteConfirm(false);
      return;
    }
    setDeleting(true);
    const result = await deleteNote(note.id, session.access_token);
    setDeleting(false);
    setShowDeleteConfirm(false);
    if (result.ok) {
      onDeleted(note.id);
    }
  }

  if (onSelect) {
    return (
      <div className={`relative ${cardBaseClassName}`}>
        {onDeleted && (
          <button
            type="button"
            onClick={openDeleteConfirm}
            disabled={deleting}
            className="absolute top-2 right-2 p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
            aria-label="Delete note"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onSelect(note)}
          className={`block w-full text-left flex flex-col flex-1 min-h-0 -m-4 p-4 ${onDeleted ? "pt-9" : "pt-4"}`}
        >
          <h2 className="font-medium text-stone-900 text-base mb-1 line-clamp-2 break-words">
            {title}
          </h2>
          <p className="text-stone-600 text-sm flex-1 line-clamp-4 break-words">
            {snippet}
          </p>
        </button>
        <ConfirmDialog
          open={showDeleteConfirm}
          title="Delete note?"
          message="This cannot be undone."
          confirmLabel="Delete"
          loadingConfirmLabel="Deleting…"
          variant="danger"
          loading={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      </div>
    );
  }

  return (
    <div className={`relative ${cardBaseClassName}`}>
      {onDeleted && (
        <button
          type="button"
          onClick={openDeleteConfirm}
          disabled={deleting}
          className="absolute top-2 right-2 p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
          aria-label="Delete note"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      )}
      <Link
        href={`/notes/${note.id}`}
        className={`block w-full flex flex-col flex-1 min-h-0 -m-4 p-4 ${onDeleted ? "pt-9" : "pt-4"}`}
      >
        <h2 className="font-medium text-stone-900 text-base mb-1 line-clamp-2 break-words">
          {title}
        </h2>
        <p className="text-stone-600 text-sm flex-1 line-clamp-4 break-words">
          {snippet}
        </p>
      </Link>
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete note?"
        message="This cannot be undone."
        confirmLabel="Delete"
        loadingConfirmLabel="Deleting…"
        variant="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
