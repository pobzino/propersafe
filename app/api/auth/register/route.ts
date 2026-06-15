import { createAdminClient } from "@/lib/supabase/admin";
import { isStaff } from "@/lib/auth/staff";
import { NextRequest, NextResponse } from "next/server";

// Staff account creation. The allowlist is enforced here, server-side — the
// public Supabase signup endpoint is never called from the client, so a random
// visitor cannot mint an internal account.
export async function POST(request: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = body.email?.trim();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }
  if (!isStaff(email)) {
    return NextResponse.json(
      { error: "This email is not authorised for a staff account." },
      { status: 403 }
    );
  }

  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
