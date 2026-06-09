import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { sendRiskCalculatorNotification } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();

    const { firstName, email, score, answers } = body;

    if (!email || !firstName) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      );
    }

    const riskLevel = score >= 18 ? "High" : score >= 10 ? "Moderate" : "Low";
    
    // Format notes with answer breakdown
    const notes = `Risk Assessment Score: ${score}/25 (${riskLevel} Risk)\n\nBreakdown:\n` + 
      answers.map((a: any, i: number) => `Q${i+1}: ${a.question}\nA: ${a.answer} (${a.points} pts)`).join("\n\n");

    // Create or find client
    const { data: existingClient } = await supabase
      .from("clients")
      .select("id, notes")
      .eq("email", email)
      .maybeSingle();

    if (existingClient) {
      // Update existing client with new notes
      const updatedNotes = existingClient.notes 
        ? `${existingClient.notes}\n\n---\n\n${notes}`
        : notes;
        
      await supabase
        .from("clients")
        .update({ name: firstName, notes: updatedNotes })
        .eq("id", existingClient.id);
    } else {
      // Create new client
      await supabase
        .from("clients")
        .insert({
          name: firstName,
          email: email,
          notes: notes
        });
    }

    // Send admin notification
    await sendRiskCalculatorNotification({
      name: firstName,
      email,
      score,
      answers
    }).catch(err => console.error("[email] Risk calc notify failed:", err));

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    console.error("[api/risk-calculator] error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
