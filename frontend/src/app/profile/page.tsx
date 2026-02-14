/**
 * Profile: avatar upload/edit (Lean MVP).
 * See AVATAR-03, AVATAR-04.
 */
export default function ProfilePage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <p className="text-gray-600">
        Avatar upload and display will go here.
      </p>
      <a href="/dashboard" className="mt-4 inline-block text-blue-600 hover:underline">
        ← Dashboard
      </a>
    </main>
  );
}
