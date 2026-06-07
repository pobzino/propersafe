import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();
  const body = await request.json();

  // Get old status for logging
  const { data: oldCase } = await supabase
    .from("cases")
    .select("status")
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("cases")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log status change if applicable
  if (oldCase && body.status && oldCase.status !== body.status) {
    await supabase.from("status_updates").insert({
      case_id: id,
      old_status: oldCase.status,
      new_status: body.status,
      triggered_by: "human",
      notes: `Case status changed from ${oldCase.status} to ${body.status}`,
    });
  }

  return NextResponse.json({ data });
}
