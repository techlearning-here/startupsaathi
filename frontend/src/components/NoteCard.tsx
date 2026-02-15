/**
 * Keep-style note card. With onSelect: opens in-place (e.g. modal). Without: links to note page.
 */
import Link from "next/link";
import type { Note } from "@/lib/api";

const BODY_SNIPPET_LENGTH = 150;

function noteSnippet(body: string): string {
  const trimmed = body.trim();
  if (trimmed.length <= BODY_SNIPPET_LENGTH) return trimmed;
  return trimmed.slice(0, BODY_SNIPPET_LENGTH) + "…";
}

const cardClassName =
  "block bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow p-4 h-full min-h-[140px] flex flex-col text-left w-full";

export function NoteCard({
  note,
  onSelect,
}: {
  note: Note;
  onSelect?: (note: Note) => void;
}) {
  const title = note.title?.trim() || "Untitled";
  const snippet = noteSnippet(note.body);

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(note)}
        className={cardClassName}
      >
        <h2 className="font-medium text-stone-900 text-base mb-1 line-clamp-2 break-words">
          {title}
        </h2>
        <p className="text-stone-600 text-sm flex-1 line-clamp-4 break-words">
          {snippet}
        </p>
      </button>
    );
  }

  return (
    <Link href={`/notes/${note.id}`} className={cardClassName}>
      <h2 className="font-medium text-stone-900 text-base mb-1 line-clamp-2 break-words">
        {title}
      </h2>
      <p className="text-stone-600 text-sm flex-1 line-clamp-4 break-words">
        {snippet}
      </p>
    </Link>
  );
}
