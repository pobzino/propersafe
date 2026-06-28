import { createAdminClient } from "@/lib/supabase/admin";
import StatusBadge from "@/components/shared/StatusBadge";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Plus, Search, FolderOpen } from "lucide-react";

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  // Staff page (layout gates to staff). RLS on cases is client-portal only, so
  // read with the admin client or staff sees nothing.
  const supabase = createAdminClient();

  let query = supabase
    .from("cases")
    .select("*, clients(name, email), professionals(name)")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data: cases } = await query;

  const filtered = (cases || []).filter((c) => {
    if (!q) return true;
    const term = q.toLowerCase();
    return (
      c.case_ref.toLowerCase().includes(term) ||
      (c.clients?.name || "").toLowerCase().includes(term) ||
      (c.property_location || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-ink">Cases</h1>
          <p className="text-sm text-ink-muted mt-1">
            {filtered.length} case{filtered.length !== 1 ? "s" : ""}
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

      <div className="mb-6">
        <form className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
            />
            <input
              type="search"
              name="q"
              defaultValue={q || ""}
              placeholder="Search cases..."
              className="w-full rounded-lg border border-border bg-white pl-9 pr-3 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 shadow-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
            />
          </div>
          <select
            name="status"
            defaultValue={status || ""}
            className="rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
          >
            <option value="">All statuses</option>
            <option value="enquiry_received">Enquiry Received</option>
            <option value="scoped">Scoped</option>
            <option value="documents_pending">Documents Pending</option>
            <option value="checks_in_progress">Checks in Progress</option>
            <option value="checks_complete">Checks Complete</option>
            <option value="report_drafting">Report Drafting</option>
            <option value="report_delivered">Report Delivered</option>
            <option value="closed">Closed</option>
          </select>
          <button
            type="submit"
            className="rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-ink-light transition-colors"
          >
            Filter
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-border bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background">
              <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Ref
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Client
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Service
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Location
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Status
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Created
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr
                key={c.id}
                className="border-b border-border last:border-0 hover:bg-background/60 transition-colors"
              >
                <td className="px-5 py-4">
                  <Link
                    href={`/cases/${c.id}`}
                    className="inline-flex items-center rounded-md bg-background px-2 py-1 text-xs font-mono font-semibold text-ink-muted hover:text-gold hover:bg-gold-bg/50 transition-colors"
                  >
                    {c.case_ref}
                  </Link>
                </td>
                <td className="px-5 py-4">
                  <p className="font-medium text-ink">{c.clients?.name}</p>
                  <p className="text-xs text-ink-muted mt-0.5">{c.clients?.email}</p>
                </td>
                <td className="px-5 py-4 text-ink-light capitalize">
                  {c.service_type.replace(/_/g, " ")}
                </td>
                <td className="px-5 py-4 text-ink-light">
                  {c.property_location || "—"}
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-5 py-4 text-ink-muted">
                  {formatDistanceToNow(new Date(c.created_at), {
                    addSuffix: true,
                  })}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-background mb-3">
                    <FolderOpen size={22} className="text-ink-muted" />
                  </div>
                  <p className="text-sm font-semibold text-ink-muted">No cases found</p>
                  <p className="text-xs text-ink-muted/70 mt-1">
                    Try adjusting your search or filters
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
