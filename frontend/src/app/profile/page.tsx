/**
 * Profile: avatar upload/edit (Lean MVP). Protected route (AUTH-05).
 */
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/SignOutButton";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <SignOutButton />
      </div>
      <p className="text-gray-600">
        Avatar upload and display will go here.
      </p>
      <a href="/dashboard" className="mt-4 inline-block text-blue-600 hover:underline">
        ← Dashboard
      </a>
    </main>
  );
}
