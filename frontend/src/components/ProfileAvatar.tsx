"use client";

/**
 * Profile avatar: display + upload/replace (AVATAR-03).
 * Writes user/me to sessionStorage so dashboard can reuse and skip GET /users/me.
 */
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getMe, uploadAvatar } from "@/lib/api";
import { setUserMeCache } from "@/lib/userMeCache";
import { Avatar } from "@/components/Avatar";

const ALLOWED_ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_MB = 2;

type Props = {
  initialAvatarUrl?: string | null;
  initialEmail?: string | null;
};

export function ProfileAvatar({
  initialAvatarUrl,
  initialEmail,
}: Props) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl ?? null);
  const [email] = useState(initialEmail ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUserMeCache({
      avatar_url: initialAvatarUrl ?? null,
      email: initialEmail ?? null,
    });
  }, [initialAvatarUrl, initialEmail]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`File too large (max ${MAX_MB} MB).`);
      return;
    }
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setError("Not authenticated.");
      return;
    }
    setUploading(true);
    const result = await uploadAvatar(session.access_token, file);
    setUploading(false);
    if (result.ok) {
      const sep = result.avatar_url.includes("?") ? "&" : "?";
      const url = result.avatar_url + sep + "t=" + Date.now();
      setAvatarUrl(url);
      setUserMeCache({ avatar_url: url, email: email ?? undefined });
    } else {
      setError(result.message || "Upload failed.");
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar avatarUrl={avatarUrl} email={email} size="lg" />
        <div>
          <label className="inline-block px-4 py-2 bg-amber-400 hover:bg-amber-500 text-stone-900 rounded-lg font-medium cursor-pointer disabled:opacity-50">
            {uploading ? "Uploading…" : "Change photo"}
            <input
              ref={inputRef}
              type="file"
              accept={ALLOWED_ACCEPT}
              className="sr-only"
              disabled={uploading}
              onChange={handleFileChange}
            />
          </label>
          <p className="mt-1 text-stone-500 text-sm">
            JPEG, PNG or WebP, max {MAX_MB} MB
          </p>
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <Link
        href="/dashboard"
        className="inline-block text-stone-500 hover:text-stone-700 text-sm"
      >
        ← Dashboard
      </Link>
    </div>
  );
}
