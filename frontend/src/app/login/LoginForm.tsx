"use client";

/**
 * Sign in with Google button; redirects to Supabase OAuth then callback.
 * AUTH-03.1: User clicks "Sign in with Google" -> redirected to Google consent.
 */
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const callbackError = searchParams.get("error");
    const message = searchParams.get("message");
    if (callbackError === "auth_callback_error") {
      setError(
        message
          ? decodeURIComponent(message)
          : "Sign-in failed. Please try again."
      );
    }
  }, [searchParams]);

  async function handleSignInWithGoogle() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      setError("Sign-in could not start. Try again.");
      setLoading(false);
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={handleSignInWithGoogle}
        disabled={loading}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Redirecting…" : "Sign in with Google"}
      </button>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <a href="/" className="text-blue-600 hover:underline">
        ← Back to home
      </a>
    </div>
  );
}
