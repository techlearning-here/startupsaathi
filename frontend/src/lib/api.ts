/**
 * Backend API client. Use with Supabase session access_token.
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type UserMe = {
  id: string;
  email?: string | null;
  avatar_url?: string | null;
};

/**
 * Get current user including avatar_url (AVATAR-02).
 */
export async function getMe(accessToken: string): Promise<UserMe | null> {
  const res = await fetch(`${API_BASE}/api/v1/users/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export type UploadAvatarResult =
  | { ok: true; avatar_url: string }
  | { ok: false; status: number; message: string };

/**
 * Upload avatar image (AVATAR-01). Max 2 MB; JPEG, PNG, WebP.
 */
export async function uploadAvatar(
  accessToken: string,
  file: File
): Promise<UploadAvatarResult> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/api/v1/users/me/avatar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      typeof data?.detail === "string"
        ? data.detail
        : data?.detail
          ? JSON.stringify(data.detail)
          : res.statusText;
    return { ok: false, status: res.status, message };
  }
  return { ok: true, avatar_url: (data as { avatar_url: string }).avatar_url };
}

export type Note = {
  id: string;
  user_id: string;
  title: string | null;
  body: string;
  created_at: string;
  updated_at: string;
};

/**
 * Fetch current user's notes from the backend. Requires valid access_token.
 */
export async function fetchNotes(accessToken: string): Promise<Note[]> {
  const res = await fetch(`${API_BASE}/api/v1/notes`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    return [];
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Fetch a single note by id. Returns null if not found or not owned.
 */
export async function fetchNote(
  id: string,
  accessToken: string
): Promise<Note | null> {
  const res = await fetch(`${API_BASE}/api/v1/notes/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export type CreateNotePayload = { body: string; title?: string | null };

export type CreateNoteApiResult =
  | { ok: true; note: Note }
  | { ok: false; status: number; message: string };

/**
 * Create a note via the backend. Requires valid access_token.
 */
export async function createNote(
  accessToken: string,
  payload: CreateNotePayload
): Promise<CreateNoteApiResult> {
  const res = await fetch(`${API_BASE}/api/v1/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      body: payload.body.trim(),
      title: payload.title?.trim() || null,
    }),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      typeof data?.detail === "string"
        ? data.detail
        : data?.detail
          ? JSON.stringify(data.detail)
          : res.statusText;
    return { ok: false, status: res.status, message };
  }
  return { ok: true, note: data as Note };
}

export type DeleteNoteApiResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

/**
 * Delete a note via the backend. Requires valid access_token and note ownership. Returns 204 on success.
 */
export async function deleteNote(
  id: string,
  accessToken: string
): Promise<DeleteNoteApiResult> {
  const res = await fetch(`${API_BASE}/api/v1/notes/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });
  if (res.ok) {
    return { ok: true };
  }
  const data = await res.json().catch(() => ({}));
  const message =
    typeof data?.detail === "string"
      ? data.detail
      : data?.detail
        ? JSON.stringify(data.detail)
        : res.statusText;
  return { ok: false, status: res.status, message };
}

export type UpdateNotePayload = { body: string; title?: string | null };

export type UpdateNoteApiResult =
  | { ok: true; note: Note }
  | { ok: false; status: number; message: string };

/**
 * Update a note via the backend. Requires valid access_token and note ownership.
 */
export async function updateNote(
  id: string,
  accessToken: string,
  payload: UpdateNotePayload
): Promise<UpdateNoteApiResult> {
  const res = await fetch(`${API_BASE}/api/v1/notes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      body: payload.body.trim(),
      title: payload.title?.trim() ?? null,
    }),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      typeof data?.detail === "string"
        ? data.detail
        : data?.detail
          ? JSON.stringify(data.detail)
          : res.statusText;
    return { ok: false, status: res.status, message };
  }
  return { ok: true, note: data as Note };
}
