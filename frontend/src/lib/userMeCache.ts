/**
 * Session cache for current user (avatar_url, email) so dashboard can reuse
 * data already fetched on Profile and avoid an extra GET /users/me.
 */
const KEY = "launchmitra_user_me";

export type UserMeCache = {
  avatar_url?: string | null;
  email?: string | null;
};

export function getUserMeCache(): UserMeCache | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserMeCache;
  } catch {
    return null;
  }
}

/** Dispatched after cache is updated so header/other consumers can refresh. */
export const USER_ME_CACHE_UPDATED = "launchmitra_user_me_updated";

export function setUserMeCache(me: UserMeCache): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(me));
    window.dispatchEvent(new CustomEvent(USER_ME_CACHE_UPDATED));
  } catch {
    // ignore
  }
}
