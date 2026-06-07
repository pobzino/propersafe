import { createClient } from "@/lib/supabase/server";
import { CASE_STATUSES, CASE_STATUS_LABELS, CaseStatus } from "@/lib/utils/checks";
import StatusBadge from "@/components/shared/StatusBadge";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Plus, AlertCircle, Clock, CheckCircle2 } from "lucide-react";

function caseHealth(
  status: string,
  deadline: string | null,
  checks: { status: string }[]
): { className: string; label: string; icon: React.ReactNode } {
  if (status === "blocked" || status === "documents_pending") {
    return {
      className: "bg-red-bg/50 text-red border-red/20",
      label: "Blocked",
      icon: <AlertCircle size={12} />,
    };
  }
  if (deadline) {
    const d = new Date(deadline);
    const now = new Date();
    const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 3 && status !== "closed" && status !== "report_delivered") {
      return {
        className: "bg-amber-bg/50 text-amber border-amber/20",
        label: "Urgent",
        icon: <Clock size={12} />,
      };
    }
  }
  const blockedChecks = checks.filter((c) => c.status === "blocked").length;
  if (blockedChecks > 0) {
    return {
      className: "bg-red-bg/50 text-red border-red/20",
      label: "Blocked",
      icon: <AlertCircle size={12} />,
    };
  }
  return {
    className: "bg-green-bg/50 text-green border-green/20",
    label: "On track",
    icon: <CheckCircle2 size={12} />,
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: cases } = await supabase
    .from("cases")
    .select("*, clients(name, email), checks(status)")
    .order("created_at", { ascending: false });

  const activeStatuses = CASE_STATUSES.filter((s) => s !== "closed");

  const casesByStatus = activeStatuses.reduce((acc, status) => {
    acc[status] = (cases || []).filter((c) => c.status === status);
    return acc;
  }, {} as Record<CaseStatus, typeof cases>);

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-ink">Case pipeline</h1>
          <p className="text-sm text-ink-muted mt-1">
            {(cases || []).filter((c) => c.status !== "closed").length} active cases
          </p>
        </div>
        <Link
          href="/cases/new"
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-gold-hover hover:shadow-md transition-all"
        >
          <Plus size={16} strokeWidth={2} />
          New case
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {activeStatuses.map((status) => {
          const statusCases = casesByStatus[status] || [];
          return (
            <div key={status} className="flex flex-col">
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-sm font-semibold text-ink">
                  {CASE_STATUS_LABELS[status]}
                </h2>
                <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-background px-2 text-xs font-semibold text-ink-muted">
                  {statusCases.length}
                </span>
              </div>
              <div className="space-y-3">
                {statusCases.map((c) => {
                  const health = caseHealth(c.status, c.deadline, c.checks || []);
                  return (
                    <Link
                      key={c.id}
                      href={`/cases/${c.id}`}
                      className="group block rounded-lg border border-border bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="inline-flex items-center rounded-md bg-background px-2 py-1 text-[11px] font-mono font-semibold text-ink-muted tracking-tight">
                          {c.case_ref}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${health.className}`}
                        >
                          {health.icon}
                          {health.label}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-ink truncate">
                        {c.clients?.name || "Unknown client"}
                      </p>
                      <p className="text-xs text-ink-muted truncate mt-0.5">
                        {c.property_location || "No location"}
                      </p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                        <StatusBadge status={c.status} />
                        <span className="text-[11px] text-ink-muted">
                          {formatDistanceToNow(new Date(c.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </Link>
                  );
                })}
                {statusCases.length === 0 && (
                  <div className="rounded-lg border border-dashed border-border bg-background p-6 text-center">
                    <p className="text-xs font-semibold text-ink-muted">No cases</p>
                    <p className="text-[11px] text-ink-muted/70 mt-0.5">
                      New cases will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
