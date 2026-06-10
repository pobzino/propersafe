import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_CHECKS } from "@/lib/utils/checks";
import { nextCaseRef } from "@/lib/utils/case-ref";
import { sendTriageConfirmation, sendTriageNotification } from "@/lib/email";

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// Maps the triage "intent" answer to a service type so the case gets the right default checks.
const INTENT_SERVICE_MAP: Record<string, string> = {
  "Buy land": "validity_check",
  "Buy a house/flat/duplex": "validity_check",
  "Plan a build": "cost_preview",
  "Pay a contractor": "payment_check",
};

function deadlineFromUrgency(urgency: string): string | null {
  const days: Record<string, number> = {
    "Seller/contractor wants payment now": 2,
    "This week": 7,
    "This month": 30,
  };
  const offset = days[urgency];
  if (!offset) return null;
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();

    // The triage form submits multipart/form-data (JSON payload + optional files);
    // plain JSON is still accepted for clients without uploads.
    let body: any;
    let files: File[] = [];
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const payload = form.get("payload");
      if (typeof payload !== "string") {
        return NextResponse.json({ error: "Missing payload" }, { status: 400 });
      }
      body = JSON.parse(payload);
      files = form
        .getAll("files")
        .filter((f): f is File => f instanceof File && f.size > 0);
    } else {
      body = await request.json();
    }

    const { firstName, email, score, riskLevel } = body;
    const details = body.details || {};
    const received: string[] = Array.isArray(details.received) ? details.received : [];
    const worries: string[] = Array.isArray(details.worries) ? details.worries : [];

    if (!email || !firstName) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      );
    }

    const serviceType = INTENT_SERVICE_MAP[details.intent] || "validity_check";

    const notes =
      `Pre-Payment Risk Analysis Request\n` +
      `Intent: ${details.intent || "—"}\n` +
      `Location: ${details.location || "—"}\n` +
      `Urgency: ${details.urgency || "—"}\n` +
      (riskLevel ? `Indicative risk: ${riskLevel}${score != null ? ` (score ${score})` : ""}\n` : "") +
      `\nDocuments received (self-reported):\n${received.join(", ") || "None"}\n\n` +
      `Concerns:\n${worries.join(", ") || "None"}`;

    // Create or find client
    const { data: existingClient } = await supabase
      .from("clients")
      .select("id, notes")
      .eq("email", email)
      .maybeSingle();

    let clientId = existingClient?.id;

    if (existingClient) {
      const updatedNotes = existingClient.notes
        ? `${existingClient.notes}\n\n---\n\n${notes}`
        : notes;
      await supabase
        .from("clients")
        .update({ name: firstName, notes: updatedNotes })
        .eq("id", existingClient.id);
    } else {
      const { data: newClient, error: clientError } = await supabase
        .from("clients")
        .insert({ name: firstName, email, notes })
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

    // Create a real case so the lead shows up in the pipeline
    const caseRef = await nextCaseRef(supabase);
    const { data: newCase, error: caseError } = await supabase
      .from("cases")
      .insert({
        case_ref: caseRef,
        client_id: clientId,
        service_type: serviceType,
        property_location: details.location || null,
        status: "enquiry_received",
        payment_status: "unpaid",
        intake_notes: notes,
        client_concern: worries.join(", ") || null,
        deadline: details.urgency ? deadlineFromUrgency(details.urgency) : null,
      })
      .select()
      .single();

    if (caseError) {
      return NextResponse.json(
        { error: "Failed to create case: " + caseError.message },
        { status: 500 }
      );
    }

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

    await supabase.from("status_updates").insert({
      case_id: newCase.id,
      new_status: "enquiry_received",
      triggered_by: "system",
      notes: "Pre-payment risk analysis submitted from website",
    });

    // Upload any documents the lead attached
    const uploadedFiles: string[] = [];
    for (const file of files.slice(0, MAX_FILES)) {
      if (file.size > MAX_FILE_SIZE) continue;
      const safeName = file.name.replace(/[^\w.\-]+/g, "_");
      const path = `${newCase.id}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(path, file);
      if (uploadError) {
        console.error("[risk-calculator] upload failed:", uploadError.message);
        continue;
      }
      await supabase.from("documents").insert({
        case_id: newCase.id,
        file_path: path,
        file_name: file.name,
        uploaded_by: "client",
        notes: "Uploaded with risk analysis request",
      });
      uploadedFiles.push(file.name);
    }

    await sendTriageConfirmation({
      to: email,
      name: firstName,
      caseRef,
    }).catch((err) => console.error("[email] triage confirmation failed:", err));

    await sendTriageNotification({
      name: firstName,
      email,
      caseRef,
      riskLevel: riskLevel || null,
      score: typeof score === "number" ? score : null,
      uploadedFiles,
      details: {
        intent: details.intent || "—",
        location: details.location || "—",
        received,
        urgency: details.urgency || "—",
        worries,
      },
    }).catch((err) => console.error("[email] triage notify failed:", err));

    return NextResponse.json(
      { success: true, caseRef, uploadedFiles: uploadedFiles.length },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[api/risk-calculator] error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
