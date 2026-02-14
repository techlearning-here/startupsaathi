/**
 * Server Supabase client for Server Components, Route Handlers, Server Actions.
 * Uses cookies for session (getAll/setAll).
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignore in Server Component context (e.g. during static render)
        }
      },
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options?: Record<string, unknown>) {
        try {
          cookieStore.set(name, value, options);
        } catch {
          // Ignore in Server Component context
        }
      },
      remove(name: string, options?: Record<string, unknown>) {
        try {
          cookieStore.set(name, "", { ...options, maxAge: 0 });
        } catch {
          // Ignore in Server Component context
        }
      },
    },
  });
}
