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

  // Find the client's most recent case
  const { data: cases } = await supabase
    .from("cases")
    .select("case_ref")
    .eq("client_id", data.user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  if (cases && cases.length > 0) {
    return NextResponse.redirect(
      new URL(`/case/${cases[0].case_ref}`, request.url)
    );
  }

  // If no case found, redirect to login with a message
  return NextResponse.redirect(new URL("/client-login", request.url));
}
