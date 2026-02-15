/**
 * Login page: Google OAuth via Supabase (AUTH-03).
 * LoginForm uses useSearchParams() and must be wrapped in Suspense for static generation.
 */
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

function LoginFormFallback() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="px-6 py-3 bg-blue-600 text-white rounded-lg opacity-80">
        Sign in with Google
      </div>
      <a href="/" className="text-blue-600 hover:underline">
        ← Back to home
      </a>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold mb-4">Sign in</h1>
      <p className="text-gray-600 mb-6">
        Sign in with your Google account to continue.
      </p>
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
