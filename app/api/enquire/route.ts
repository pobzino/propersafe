import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_CHECKS } from "@/lib/utils/checks";
import { sendEnquiryConfirmation, sendAdminNotification } from "@/lib/email";
import { sendEnquiryConfirmationWhatsApp } from "@/lib/whatsapp";

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();

    // Validate required fields
    if (!body.email || !body.firstName) {
      return NextResponse.json(
        { error: "Email and first name are required" },
        { status: 400 }
      );
    }

    // Map landing page service values to DB service types
    const serviceMap: Record<string, string> = {
      land: "validity_check",
      build: "cost_preview",
      payment: "payment_check",
    };

    const serviceType = serviceMap[body.service] || "validity_check";

    // Generate case reference — find max existing ref number for this year
    const year = new Date().getFullYear();
    const { data: latestCases } = await supabase
      .from("cases")
      .select("case_ref")
      .like("case_ref", `PS-${year}-%`)
      .order("case_ref", { ascending: false })
      .limit(1);

    let nextNum = 1;
    if (latestCases && latestCases.length > 0) {
      const match = latestCases[0].case_ref.match(/-(\d+)$/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }

    const caseRef = `PS-${year}-${String(nextNum).padStart(4, "0")}`;

    // Create or find client
    const { data: existingClient, error: findError } = await supabase
      .from("clients")
      .select("id")
      .eq("email", body.email)
      .maybeSingle();

    let clientId = existingClient?.id;

    if (!clientId) {
      const { data: newClient, error: clientError } = await supabase
        .from("clients")
        .insert({
          name: `${body.firstName} ${body.lastName || ""}`.trim(),
          email: body.email,
          whatsapp: body.whatsapp || null,
          location: body.location || null,
        })
        .select()
        .single();

      if (clientError) {
        return NextResponse.json(
          { error: "Failed to create client: " + clientError.message },
          { status: 500 }
        );
      }
      clientId = newClient.id;
    }

    // Create case
    const { data: newCase, error: caseError } = await supabase
      .from("cases")
      .insert({
        case_ref: caseRef,
        client_id: clientId,
        service_type: serviceType,
        property_location: body.propertyLocation || null,
        status: "enquiry_received",
        payment_status: "unpaid",
        intake_notes: body.situation || null,
        deadline: body.urgency ? calculateDeadline(body.urgency) : null,
      })
      .select()
      .single();

    if (caseError) {
      return NextResponse.json(
        { error: "Failed to create case: " + caseError.message },
        { status: 500 }
      );
    }

    // Auto-create default checks
    const checkTypes = DEFAULT_CHECKS[serviceType as keyof typeof DEFAULT_CHECKS] || [];
    if (checkTypes.length > 0) {
      await supabase.from("checks").insert(
        checkTypes.map((checkType) => ({
          case_id: newCase.id,
          check_type: checkType,
          status: "not_started",
        }))
      );
    }

    // Log status update
    await supabase.from("status_updates").insert({
      case_id: newCase.id,
      new_status: "enquiry_received",
      triggered_by: "system",
      notes: "Enquiry submitted from landing page",
    });

    // Send confirmation email to client
    const serviceLabel =
      body.service === "land"
        ? "Land & Property Validity Check"
        : body.service === "build"
        ? "Build Cost Preview"
        : body.service === "payment"
        ? "Payment Sanity Check"
        : "Property Verification";

    await sendEnquiryConfirmation({
      to: body.email,
      name: body.firstName,
      caseRef,
      service: serviceLabel,
    }).catch((err) => console.error("[email] confirmation failed:", err));

    // Send admin notification
    await sendAdminNotification({
      caseRef,
      name: `${body.firstName} ${body.lastName || ""}`.trim(),
      email: body.email,
      whatsapp: body.whatsapp || null,
      service: serviceLabel,
      situation: body.situation || null,
      urgency: body.urgency || null,
    }).catch((err) => console.error("[email] admin notify failed:", err));

    // Send WhatsApp confirmation if number provided
    if (body.whatsapp) {
      await sendEnquiryConfirmationWhatsApp({
        to: body.whatsapp,
        name: body.firstName,
        caseRef,
      }).catch((err) => console.error("[whatsapp] failed:", err));
    }

    return NextResponse.json(
      { success: true, caseRef },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

function calculateDeadline(urgency: string): string | null {
  const now = new Date();
  switch (urgency) {
    case "asap":
      now.setDate(now.getDate() + 3);
      break;
    case "week":
      now.setDate(now.getDate() + 7);
      break;
    case "two-weeks":
      now.setDate(now.getDate() + 14);
      break;
    case "month":
      now.setDate(now.getDate() + 30);
      break;
    default:
      return null;
  }
  return now.toISOString().slice(0, 10);
}
