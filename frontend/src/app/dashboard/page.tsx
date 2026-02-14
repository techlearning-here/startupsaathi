/**
 * Dashboard: notes list and avatar (Lean MVP).
 * Protected route; see AUTH-05.
 */
export default function DashboardPage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-600">
        Notes list and add-note link will go here. Auth required.
      </p>
      <a href="/" className="mt-4 inline-block text-blue-600 hover:underline">
        ← Home
      </a>
    </main>
  );
}
