/**
 * Profile: avatar upload/edit (Lean MVP). Protected route (AUTH-05).
 */
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/SignOutButton";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { getMe } from "@/lib/api";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: { session } } = await supabase.auth.getSession();
  const me = session?.access_token ? await getMe(session.access_token) : null;

  return (
    <main className="min-h-screen bg-stone-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Profile</h1>
        <SignOutButton />
      </div>
      <ProfileAvatar
        initialAvatarUrl={me?.avatar_url}
        initialEmail={me?.email ?? user.email}
      />
    </main>
  );
}
