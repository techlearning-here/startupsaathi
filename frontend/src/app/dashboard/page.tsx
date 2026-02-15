/**
 * Dashboard: notes list in Google Keep–style layout. Protected route (AUTH-05).
 * NOTES-06: Card grid, "Take a note" bar, FAB to add note.
 */
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { DevTokenLogger } from "@/components/DevTokenLogger";
import { DashboardContent } from "@/components/DashboardContent";
import { fetchNotes } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: { session } } = await supabase.auth.getSession();
  const notes = session?.access_token
    ? await fetchNotes(session.access_token)
    : [];

  return (
    <main className="min-h-screen bg-stone-100">
      <DevTokenLogger />
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-stone-200 px-4 py-3 flex justify-between items-center">
        <Link href="/dashboard" className="font-semibold text-stone-800 text-lg" prefetch={false}>
          LaunchMitra
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-stone-500 text-sm hidden sm:inline">
            {user.email}
          </span>
          <SignOutButton />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <DashboardContent initialNotes={notes} />

        <Link
          href="/profile"
          className="mt-8 inline-block text-stone-500 hover:text-stone-700 text-sm"
        >
          Profile →
        </Link>
      </div>
    </main>
  );
}
