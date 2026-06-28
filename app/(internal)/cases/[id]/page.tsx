import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import CaseDetail from "@/components/internal/CaseDetail";

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Staff page (layout gates to staff). Read with admin client; RLS is client-only.
  const supabase = createAdminClient();

  const { data: caseData } = await supabase
    .from("cases")
    .select("*, clients(*), professionals(name)")
    .eq("id", id)
    .single();

  if (!caseData) {
    notFound();
  }

  const { data: checks } = await supabase
    .from("checks")
    .select("*, professionals(name, specialism)")
    .eq("case_id", id)
    .order("created_at", { ascending: true });

  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("case_id", id)
    .order("created_at", { ascending: false });

  const { data: statusUpdates } = await supabase
    .from("status_updates")
    .select("*")
    .eq("case_id", id)
    .order("created_at", { ascending: false });

  const { data: professionals } = await supabase
    .from("professionals")
    .select("*")
    .eq("active", true)
    .order("name");

  return (
    <CaseDetail
      caseData={caseData}
      checks={checks || []}
      documents={documents || []}
      statusUpdates={statusUpdates || []}
      professionals={professionals || []}
    />
  );
}
