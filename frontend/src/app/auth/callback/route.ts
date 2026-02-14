/**
 * OAuth callback: exchange code for session and redirect to dashboard.
 * AUTH-03.2: User completes Google consent -> callback returns -> user signed in.
 * Serializes by code so duplicate concurrent requests share one Supabase exchange.
 */
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type ExchangeResult = { error: { message: string } | null };

const inFlightByCode = new Map<string, Promise<ExchangeResult>>();

async function exchangeOnce(code: string): Promise<ExchangeResult> {
  const existing = inFlightByCode.get(code);
  if (existing) return existing;

  const promise = (async () => {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return { error };
  })();
  inFlightByCode.set(code, promise);
  try {
    const result = await promise;
    return result;
  } finally {
    inFlightByCode.delete(code);
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    return NextResponse.redirect(`${origin}${next}`, 303);
  }

  if (code) {
    const { error } = await exchangeOnce(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`, 303);
    }
    const message = encodeURIComponent(error.message);
    return NextResponse.redirect(
      `${origin}/login?error=auth_callback_error&message=${message}`
    );
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
