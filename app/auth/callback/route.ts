import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/client-login", request.url));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(new URL("/client-login", request.url));
  }

  // Resolve the client by email. Clients are created by the public intake forms
  // with their own primary key and no link to auth.users, so we match on the
  // authenticated email — the same ownership rule the case page enforces.
  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("email", data.user.email)
    .maybeSingle();

  if (client) {
    const { data: cases } = await supabase
      .from("cases")
      .select("case_ref")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (cases && cases.length > 0) {
      return NextResponse.redirect(
        new URL(`/case/${cases[0].case_ref}`, request.url)
      );
    }
  }

  // Authenticated but no case on file for this email — send back to the portal.
  return NextResponse.redirect(new URL("/client-login", request.url));
}
