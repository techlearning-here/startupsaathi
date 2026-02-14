/**
 * Login page: Google OAuth via Supabase (AUTH-03).
 */
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold mb-4">Sign in</h1>
      <p className="text-gray-600 mb-6">
        Sign in with your Google account to continue.
      </p>
      <LoginForm />
    </main>
  );
}
