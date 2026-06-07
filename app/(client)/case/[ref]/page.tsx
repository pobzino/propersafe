import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { format } from "date-fns";
import { CASE_STATUS_LABELS, SERVICE_LABELS } from "@/lib/utils/checks";
import ClientCaseView from "@/components/client/ClientCaseView";

export default async function ClientCasePage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/client-login");
  }

  // Fetch case with related data
  const { data: caseData } = await supabase
    .from("cases")
    .select("*, clients(*), checks(*), documents(*), status_updates(*), reports(*)")
    .eq("case_ref", ref)
    .single();

  if (!caseData) {
    notFound();
  }

  // Verify ownership by email
  if (caseData.clients?.email !== user.email) {
    redirect("/client-login");
  }

  return <ClientCaseView caseData={caseData} userEmail={user.email || ""} />;
}
