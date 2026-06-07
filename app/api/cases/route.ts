import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_CHECKS } from "@/lib/utils/checks";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let query = supabase
    .from("cases")
    .select("*, clients(name, email), professionals(name)")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const body = await request.json();

  // Generate case reference
  const year = new Date().getFullYear();
  const { data: countData } = await supabase
    .from("cases")
    .select("id", { count: "exact", head: true })
    .gte("created_at", `${year}-01-01`)
    .lte("created_at", `${year}-12-31`);

  const count = (countData?.length ?? 0) + 1;
  const caseRef = `PS-${year}-${String(count).padStart(4, "0")}`;

  // Create or find client
  let clientId = body.client_id;
  if (!clientId && body.client_email) {
    const { data: existingClient } = await supabase
      .from("clients")
      .select("id")
      .eq("email", body.client_email)
      .single();

    if (existingClient) {
      clientId = existingClient.id;
    } else {
      const { data: newClient, error: clientError } = await supabase
        .from("clients")
        .insert({
          name: body.client_name,
          email: body.client_email,
          whatsapp: body.client_whatsapp,
          location: body.client_location,
        })
        .select()
        .single();

      if (clientError) {
        return NextResponse.json({ error: clientError.message }, { status: 500 });
      }
      clientId = newClient.id;
    }
  }

  const { data: newCase, error: caseError } = await supabase
    .from("cases")
    .insert({
      case_ref: caseRef,
      client_id: clientId,
      service_type: body.service_type,
      property_location: body.property_location,
      property_type: body.property_type,
      status: body.status || "enquiry_received",
      payment_status: body.payment_status || "unpaid",
      payment_amount: body.payment_amount,
      deadline: body.deadline,
      intake_notes: body.intake_notes,
      client_concern: body.client_concern,
      internal_notes: body.internal_notes,
    })
    .select()
    .single();

  if (caseError) {
    return NextResponse.json({ error: caseError.message }, { status: 500 });
  }

  // Auto-create default checks
  const serviceType = body.service_type as keyof typeof DEFAULT_CHECKS;
  const checkTypes = DEFAULT_CHECKS[serviceType] || [];

  if (checkTypes.length > 0) {
    const checksToInsert = checkTypes.map((checkType) => ({
      case_id: newCase.id,
      check_type: checkType,
      status: "not_started",
    }));

    await supabase.from("checks").insert(checksToInsert);
  }

  // Log status update
  await supabase.from("status_updates").insert({
    case_id: newCase.id,
    new_status: newCase.status,
    triggered_by: "human",
    notes: "Case created",
  });

  return NextResponse.json({ data: newCase }, { status: 201 });
}
