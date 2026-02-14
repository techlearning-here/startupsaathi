import Link from "next/link";

/**
 * Landing page: hero and Sign in with Google (Lean MVP).
 */
export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-2">LaunchMitra</h1>
      <p className="text-lg text-gray-600 mb-8">
        Your Startup Journey, Simplified
      </p>
      <Link
        href="/login"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Sign in with Google
      </Link>
    </main>
  );
}
