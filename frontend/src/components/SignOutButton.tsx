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
      className="px-3 py-1.5 text-sm text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
    >
      Sign out
    </button>
  );
}
