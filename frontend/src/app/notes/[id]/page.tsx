/**
 * View a single note. Keep-style card layout. Edit UI in NOTES-08.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchNote } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type PageProps = { params: Promise<{ id: string }> };

export default async function NotePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: { session } } = await supabase.auth.getSession();
  const note = session?.access_token
    ? await fetchNote(id, session.access_token)
    : null;

  if (!note) {
    notFound();
  }

  const title = note.title?.trim() || "Untitled";
  const updated = new Date(note.updated_at).toLocaleDateString(undefined, {
    dateStyle: "medium",
  });

  return (
    <main className="min-h-screen bg-stone-100">
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-stone-200 px-4 py-3 flex justify-between items-center">
        <Link
          href="/dashboard"
          className="text-stone-600 hover:text-stone-900 text-sm"
        >
          ← Notes
        </Link>
        <Link
          href={`/notes/${id}/edit`}
          className="text-stone-600 hover:text-stone-900 text-sm"
        >
          Edit
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <article className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
          <h1 className="text-xl font-medium text-stone-900 mb-1">{title}</h1>
          <p className="text-stone-500 text-sm mb-4">{updated}</p>
          <div className="text-stone-700 whitespace-pre-wrap leading-relaxed">
            {note.body}
          </div>
        </article>
      </div>
    </main>
  );
}
