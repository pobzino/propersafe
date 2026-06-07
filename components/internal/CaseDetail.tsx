"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import StatusBadge from "@/components/shared/StatusBadge";
import {
  CASE_STATUS_LABELS,
  CHECK_STATUS_LABELS,
  CHECK_LABELS,
  DOC_TYPE_LABELS,
  DOC_TYPES,
  SERVICE_LABELS,
} from "@/lib/utils/checks";
import { format } from "date-fns";
import {
  ArrowLeft,
  Save,
  Upload,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  Mail,
} from "lucide-react";
import Link from "next/link";

interface CaseDetailProps {
  caseData: any;
  checks: any[];
  documents: any[];
  statusUpdates: any[];
  professionals: any[];
}

export default function CaseDetail({
  caseData,
  checks,
  documents: initialDocuments,
  statusUpdates,
  professionals,
}: CaseDetailProps) {
  const supabase = createClient();
  const [c, setC] = useState(caseData);
  const [checkList, setCheckList] = useState(checks);
  const [documents, setDocuments] = useState(initialDocuments);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const sendMagicLink = async () => {
    if (!c.clients?.email) return;
    const { error } = await supabase.auth.signInWithOtp({
      email: c.clients.email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setMessage("Failed to send magic link: " + error.message);
    } else {
      setMagicLinkSent(true);
      setMessage("Magic link sent to " + c.clients.email);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const updateField = (field: string, value: any) => {
    setC((prev: any) => ({ ...prev, [field]: value }));
  };

  const saveCase = async () => {
    setSaving(true);
    const res = await fetch(`/api/cases/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_type: c.service_type,
        property_location: c.property_location,
        property_type: c.property_type,
        status: c.status,
        payment_status: c.payment_status,
        payment_amount: c.payment_amount,
        deadline: c.deadline,
        client_concern: c.client_concern,
        internal_notes: c.internal_notes,
      }),
    });

    setSaving(false);
    if (!res.ok) {
      const json = await res.json();
      setMessage("Error saving: " + (json.error || "Unknown error"));
    } else {
      setMessage("Saved successfully");
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const updateCheck = async (checkId: string, updates: any) => {
    const res = await fetch("/api/checks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: checkId, ...updates }),
    });

    if (res.ok) {
      const { data } = await res.json();
      setCheckList((prev) =>
        prev.map((chk) => (chk.id === checkId ? { ...chk, ...data } : chk))
      );
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const path = `${c.id}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(path, file);

    if (uploadError) {
      setMessage("Upload error: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: docData, error: docError } = await supabase
      .from("documents")
      .insert({
        case_id: c.id,
        file_path: path,
        file_name: file.name,
        uploaded_by: "coordinator",
      })
      .select()
      .single();

    setUploading(false);

    if (docError) {
      setMessage("Document record error: " + docError.message);
    } else {
      setDocuments((prev) => [docData, ...prev]);
      setMessage("Document uploaded");
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const daysElapsed = Math.floor(
    (Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/cases"
          className="text-ink-muted hover:text-ink"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-ink">{c.case_ref}</h1>
            <StatusBadge status={c.status} />
          </div>
          <p className="text-sm text-ink-muted">
            {c.clients?.name} • {daysElapsed} days elapsed
          </p>
        </div>
      </div>

      {message && (
        <div className="mb-4 rounded-md bg-green-bg px-3 py-2 text-sm text-green">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Case info */}
          <section className="rounded-md border border-border bg-surface p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-ink">Case details</h2>
              <button
                onClick={saveCase}
                disabled={saving}
                className="inline-flex items-center gap-1 rounded-md bg-gold px-3 py-1.5 text-xs font-medium text-white hover:bg-gold-hover disabled:opacity-50"
              >
                <Save size={13} />
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1">
                  Client
                </label>
                <p className="text-sm text-ink">{c.clients?.name}</p>
                <p className="text-xs text-ink-muted">{c.clients?.email}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1">
                  Service type
                </label>
                <select
                  value={c.service_type}
                  onChange={(e) => updateField("service_type", e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                >
                  {Object.entries(SERVICE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1">
                  Property location
                </label>
                <input
                  type="text"
                  value={c.property_location || ""}
                  onChange={(e) => updateField("property_location", e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1">
                  Property type
                </label>
                <select
                  value={c.property_type || ""}
                  onChange={(e) => updateField("property_type", e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                >
                  <option value="">Select...</option>
                  <option value="land">Land</option>
                  <option value="flat">Flat</option>
                  <option value="duplex">Duplex</option>
                  <option value="built_property">Built Property</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1">
                  Status
                </label>
                <select
                  value={c.status}
                  onChange={(e) => updateField("status", e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                >
                  {Object.entries(CASE_STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1">
                  Payment status
                </label>
                <select
                  value={c.payment_status || "unpaid"}
                  onChange={(e) => updateField("payment_status", e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1">
                  Payment amount (₦)
                </label>
                <input
                  type="number"
                  value={c.payment_amount || ""}
                  onChange={(e) =>
                    updateField("payment_amount", e.target.value ? Number(e.target.value) : null)
                  }
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1">
                  Deadline
                </label>
                <input
                  type="date"
                  value={c.deadline ? c.deadline.slice(0, 10) : ""}
                  onChange={(e) => updateField("deadline", e.target.value || null)}
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-ink-muted mb-1">
                  Client concern
                </label>
                <textarea
                  value={c.client_concern || ""}
                  onChange={(e) => updateField("client_concern", e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-ink-muted mb-1">
                  Internal notes
                </label>
                <textarea
                  value={c.internal_notes || ""}
                  onChange={(e) => updateField("internal_notes", e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                />
              </div>
            </div>
          </section>

          {/* Checks */}
          <section className="rounded-md border border-border bg-surface p-4">
            <h2 className="text-sm font-semibold text-ink mb-3">Checks</h2>
            <div className="space-y-2">
              {checkList.map((check) => (
                <div
                  key={check.id}
                  className="rounded-md border border-border p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-ink">
                      {CHECK_LABELS[check.check_type as keyof typeof CHECK_LABELS] ||
                        check.check_type}
                    </span>
                    <StatusBadge status={check.status} type="check" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-medium text-ink-muted uppercase tracking-wider mb-1">
                        Assigned to
                      </label>
                      <select
                        value={check.assigned_to || ""}
                        onChange={(e) =>
                          updateCheck(check.id, {
                            assigned_to: e.target.value || null,
                          })
                        }
                        className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                      >
                        <option value="">Unassigned</option>
                        {professionals.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.specialism})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-ink-muted uppercase tracking-wider mb-1">
                        Status
                      </label>
                      <select
                        value={check.status}
                        onChange={(e) =>
                          updateCheck(check.id, { status: e.target.value })
                        }
                        className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                      >
                        {Object.entries(CHECK_STATUS_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-ink-muted uppercase tracking-wider mb-1">
                        Due date
                      </label>
                      <input
                        type="date"
                        value={check.due_date ? check.due_date.slice(0, 10) : ""}
                        onChange={(e) =>
                          updateCheck(check.id, {
                            due_date: e.target.value || null,
                          })
                        }
                        className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                      />
                    </div>
                  </div>
                  {check.status === "blocked" && (
                    <div className="mt-2">
                      <input
                        type="text"
                        placeholder="Blocked reason..."
                        value={check.blocked_reason || ""}
                        onChange={(e) =>
                          updateCheck(check.id, { blocked_reason: e.target.value })
                        }
                        className="w-full rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red"
                      />
                    </div>
                  )}
                  <div className="mt-2">
                    <label className="block text-[10px] font-medium text-ink-muted uppercase tracking-wider mb-1">
                      Findings
                    </label>
                    <textarea
                      value={check.findings || ""}
                      onChange={(e) =>
                        updateCheck(check.id, { findings: e.target.value })
                      }
                      rows={2}
                      placeholder="Enter findings..."
                      className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                    />
                  </div>
                </div>
              ))}
              {checkList.length === 0 && (
                <p className="text-sm text-ink-muted">No checks for this case.</p>
              )}
            </div>
          </section>

          {/* Documents */}
          <section className="rounded-md border border-border bg-surface p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-ink">Documents</h2>
              <label className="inline-flex items-center gap-1 rounded-md bg-gold px-3 py-1.5 text-xs font-medium text-white hover:bg-gold-hover cursor-pointer">
                <Upload size={13} />
                {uploading ? "Uploading..." : "Upload"}
                <input
                  type="file"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </label>
            </div>
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-md border border-border p-2.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {doc.file_name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <ImageIcon size={16} className="text-ink-muted shrink-0" />
                    ) : (
                      <FileText size={16} className="text-ink-muted shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm text-ink truncate">{doc.file_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <select
                          value={doc.doc_type || ""}
                          onChange={async (e) => {
                            const newType = e.target.value || null;
                            await supabase
                              .from("documents")
                              .update({ doc_type: newType })
                              .eq("id", doc.id);
                            setDocuments((prev) =>
                              prev.map((d) =>
                                d.id === doc.id ? { ...d, doc_type: newType } : d
                              )
                            );
                          }}
                          className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px]"
                        >
                          <option value="">Type...</option>
                          {DOC_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {DOC_TYPE_LABELS[t]}
                            </option>
                          ))}
                        </select>
                        <span className="text-[10px] text-ink-muted">
                          {format(new Date(doc.created_at), "dd MMM yyyy")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <a
                    href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${doc.file_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gold hover:text-gold-hover shrink-0 ml-2"
                  >
                    View
                  </a>
                </div>
              ))}
              {documents.length === 0 && (
                <p className="text-sm text-ink-muted">No documents uploaded yet.</p>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status log */}
          <section className="rounded-md border border-border bg-surface p-4">
            <h2 className="text-sm font-semibold text-ink mb-3">Status log</h2>
            <div className="space-y-3">
              {statusUpdates.map((su) => (
                <div key={su.id} className="flex gap-2.5">
                  <div className="mt-0.5">
                    {su.new_status?.startsWith("check:complete") ? (
                      <CheckCircle2 size={14} className="text-green" />
                    ) : su.new_status?.startsWith("check:blocked") ? (
                      <AlertCircle size={14} className="text-red" />
                    ) : (
                      <Clock size={14} className="text-ink-muted" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-ink">
                      {su.old_status
                        ? `${su.old_status.replace("check:", "")} → ${su.new_status.replace("check:", "")}`
                        : su.new_status}
                    </p>
                    {su.notes && (
                      <p className="text-[11px] text-ink-muted mt-0.5">{su.notes}</p>
                    )}
                    <p className="text-[10px] text-ink-muted mt-0.5">
                      {format(new Date(su.created_at), "dd MMM yyyy HH:mm")}
                    </p>
                  </div>
                </div>
              ))}
              {statusUpdates.length === 0 && (
                <p className="text-xs text-ink-muted">No status updates yet.</p>
              )}
            </div>
          </section>

          {/* Client info */}
          <section className="rounded-md border border-border bg-surface p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-ink">Client</h2>
              {c.clients?.email && (
                <button
                  onClick={sendMagicLink}
                  disabled={magicLinkSent}
                  className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px] font-medium text-ink-light hover:bg-gray-50 disabled:opacity-50"
                  title="Send client portal access link"
                >
                  <Mail size={10} />
                  {magicLinkSent ? "Sent" : "Magic link"}
                </button>
              )}
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-ink-muted">Name</p>
                <p className="text-sm text-ink">{c.clients?.name}</p>
              </div>
              <div>
                <p className="text-xs text-ink-muted">Email</p>
                <p className="text-sm text-ink">{c.clients?.email}</p>
              </div>
              {c.clients?.whatsapp && (
                <div>
                  <p className="text-xs text-ink-muted">WhatsApp</p>
                  <p className="text-sm text-ink">{c.clients?.whatsapp}</p>
                </div>
              )}
              {c.clients?.location && (
                <div>
                  <p className="text-xs text-ink-muted">Location</p>
                  <p className="text-sm text-ink">{c.clients?.location}</p>
                </div>
              )}
            </div>
          </section>

          {/* Intake notes */}
          {c.intake_notes && (
            <section className="rounded-md border border-border bg-surface p-4">
              <h2 className="text-sm font-semibold text-ink mb-2">Intake notes</h2>
              <p className="text-xs text-ink-light whitespace-pre-wrap">
                {c.intake_notes}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
