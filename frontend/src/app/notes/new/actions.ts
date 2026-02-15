"use server";

/**
 * Server action: create a note using the current user's session. (NOTES-07)
 */
import { createNote as apiCreateNote } from "@/lib/api";
import type { Note } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

export type CreateNoteResult =
  | { success: true; note: Note }
  | { success: false; error: string };

export async function createNoteAction(formData: {
  body: string;
  title?: string | null;
}): Promise<CreateNoteResult> {
  const body = formData.body?.trim();
  if (!body) {
    return { success: false, error: "Body is required." };
  }

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) {
    return { success: false, error: "Not authenticated." };
  }

  try {
    const result = await apiCreateNote(session.access_token, {
      body,
      title: formData.title?.trim() || null,
    });
    if (!result.ok) {
      const msg =
        result.status === 401
          ? result.message || "Not authorized. Try signing out and back in."
          : result.status === 503
            ? "Backend storage not configured."
            : result.message || "Failed to create note.";
      return { success: false, error: msg };
    }
    return { success: true, note: result.note };
  } catch {
    return {
      success: false,
      error: "Backend unreachable. Is it running? Check NEXT_PUBLIC_API_URL.",
    };
  }
}
