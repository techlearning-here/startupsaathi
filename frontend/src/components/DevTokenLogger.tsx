"use client";

/**
 * In development only: logs the Supabase access_token to the console
 * so you can copy it for Swagger Authorize (localhost:8000/docs).
 * Renders nothing.
 */
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";

export function DevTokenLogger() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        // eslint-disable-next-line no-console -- dev-only: copy token for API docs
        console.log(
          "[Dev] Supabase access_token (copy for Swagger Authorize):",
          session.access_token
        );
      }
    });
  }, []);
  return null;
}
