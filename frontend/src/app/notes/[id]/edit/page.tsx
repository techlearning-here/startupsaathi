/**
 * Edit note page. Form updates note via PUT. (NOTES-08)
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { fetchNote } from "@/lib/api";
import { EditNoteForm } from "./EditNoteForm";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditNotePage({ params }: PageProps) {
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

  return (
    <main className="min-h-screen bg-stone-100">
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-stone-200 px-4 py-3">
        <Link
          href={`/notes/${id}`}
          className="text-stone-600 hover:text-stone-900 text-sm"
        >
          ← Back to note
        </Link>
      </header>
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
          <h1 className="sr-only">Edit note</h1>
          <EditNoteForm note={note} />
        </div>
      </div>
    </main>
  );
}
