/**
 * Dashboard: notes list and avatar (Lean MVP). Protected route (AUTH-05).
 */
import { SignOutButton } from "@/components/SignOutButton";
import { DevTokenLogger } from "@/components/DevTokenLogger";
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

  return (
    <main className="min-h-screen p-8">
      <DevTokenLogger />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user.email}</span>
          <SignOutButton />
        </div>
      </div>
      <p className="text-gray-600">
        Notes list and add-note link will go here.
      </p>
      <a href="/profile" className="mt-4 inline-block text-blue-600 hover:underline">
        Profile →
      </a>
    </main>
  );
}
