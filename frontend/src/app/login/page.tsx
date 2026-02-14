/**
 * Login page: Google OAuth (Supabase Auth).
 * See LEAN_MVP_FEATURE_LIST_TDD.md AUTH-03.
 */
export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold mb-4">Sign in</h1>
      <p className="text-gray-600 mb-6">
        Google OAuth will be wired here via Supabase Auth.
      </p>
      <a
        href="/"
        className="text-blue-600 hover:underline"
      >
        ← Back to home
      </a>
    </main>
  );
}
