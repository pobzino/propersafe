import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  const body = await request.json();

  const { id, ...updates } = body;

  const { data: oldCheck } = await supabase
    .from("checks")
    .select("status")
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("checks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If status changed, log it
  if (oldCheck && updates.status && oldCheck.status !== updates.status) {
    await supabase.from("status_updates").insert({
      case_id: data.case_id,
      old_status: `check:${oldCheck.status}`,
      new_status: `check:${updates.status}`,
      triggered_by: "human",
      notes: `Check ${data.check_type} moved from ${oldCheck.status} to ${updates.status}`,
    });
  }

  return NextResponse.json({ data });
}
