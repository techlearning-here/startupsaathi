"use client";

/**
 * Sign out button: clears Supabase session and redirects to landing (AUTH-04).
 */
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
    >
      Sign out
    </button>
  );
}
