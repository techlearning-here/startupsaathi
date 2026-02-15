/**
 * Add note page. Keep-style card form. (NOTES-07)
 */
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AddNoteForm } from "./AddNoteForm";

export default async function NewNotePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-stone-100">
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-stone-200 px-4 py-3 flex justify-between items-center">
        <Link
          href="/dashboard"
          className="text-stone-600 hover:text-stone-900 text-sm"
        >
          ← Back
        </Link>
      </header>

      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
          <h1 className="sr-only">Add note</h1>
          <AddNoteForm />
        </div>
      </div>
    </main>
  );
}
