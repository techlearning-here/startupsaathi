"use server";

/**
 * Server actions for a note: update (NOTES-08), delete (NOTES-09).
 */
import { updateNote as apiUpdateNote, deleteNote as apiDeleteNote } from "@/lib/api";
import type { Note } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

export type UpdateNoteResult =
  | { success: true; note: Note }
  | { success: false; error: string };

export async function updateNoteAction(
  noteId: string,
  formData: { body: string; title?: string | null }
): Promise<UpdateNoteResult> {
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
    const result = await apiUpdateNote(noteId, session.access_token, {
      body,
      title: formData.title?.trim() || null,
    });
    if (!result.ok) {
      const msg =
        result.status === 401
          ? result.message || "Not authorized. Try signing out and back in."
          : result.status === 404
            ? "Note not found."
            : result.status === 503
              ? "Backend storage not configured."
              : result.message || "Failed to update note.";
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

export type DeleteNoteResult = { success: true } | { success: false; error: string };

export async function deleteNoteAction(noteId: string): Promise<DeleteNoteResult> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) {
    return { success: false, error: "Not authenticated." };
  }

  try {
    const result = await apiDeleteNote(noteId, session.access_token);
    if (!result.ok) {
      const msg =
        result.status === 401
          ? "Not authorized. Try signing out and back in."
          : result.status === 404
            ? "Note not found."
            : result.status === 503
              ? "Backend storage not configured."
              : result.message || "Failed to delete note.";
      return { success: false, error: msg };
    }
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Backend unreachable. Is it running? Check NEXT_PUBLIC_API_URL.",
    };
  }
}
