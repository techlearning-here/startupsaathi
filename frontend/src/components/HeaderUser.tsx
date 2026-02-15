"use client";

/**
 * Header user + avatar. Uses sessionStorage cache when present (e.g. after
 * visiting Profile) so we skip GET /users/me; otherwise fetches once and caches.
 */
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getMe } from "@/lib/api";
import { getUserMeCache, setUserMeCache, USER_ME_CACHE_UPDATED } from "@/lib/userMeCache";
import { Avatar } from "@/components/Avatar";

type Props = {
  /** From auth when dashboard doesn't call getMe(); used when cache is empty. */
  initialEmail?: string | null;
  initialAvatarUrl?: string | null;
};

export function HeaderUser({
  initialEmail,
  initialAvatarUrl,
}: Props) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl ?? null);
  const [email, setEmail] = useState<string | null>(initialEmail ?? null);

  const refreshFromCache = () => {
    const cached = getUserMeCache();
    if (cached) {
      if (cached.avatar_url != null) setAvatarUrl(cached.avatar_url);
      if (cached.email != null) setEmail(cached.email);
    }
  };

  useEffect(() => {
    const cached = getUserMeCache();
    if (cached && (cached.avatar_url != null || cached.email != null)) {
      setAvatarUrl(cached.avatar_url ?? null);
      setEmail(cached.email ?? initialEmail ?? null);
      return;
    }
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.access_token) return;
      getMe(session.access_token).then((me) => {
        if (me) {
          setAvatarUrl(me.avatar_url ?? null);
          setEmail(me.email ?? initialEmail ?? null);
          setUserMeCache({ avatar_url: me.avatar_url, email: me.email });
        } else {
          setEmail(initialEmail ?? null);
        }
      });
    });
  }, [initialEmail]);

  useEffect(() => {
    const onUpdate = () => refreshFromCache();
    window.addEventListener(USER_ME_CACHE_UPDATED, onUpdate);
    return () => window.removeEventListener(USER_ME_CACHE_UPDATED, onUpdate);
  }, []);

  return (
    <Link
      href="/profile"
      className="flex items-center gap-2 text-stone-700 hover:text-stone-900"
    >
      <Avatar avatarUrl={avatarUrl} email={email} size="sm" />
      <span className="text-stone-500 text-sm hidden sm:inline">
        {email ?? ""}
      </span>
    </Link>
  );
}
