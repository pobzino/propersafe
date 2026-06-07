"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  CASE_STATUS_LABELS,
  SERVICE_LABELS,
  DOC_TYPE_LABELS,
} from "@/lib/utils/checks";
import { format, formatDistanceToNow } from "date-fns";
import { Upload, FileText, Image as ImageIcon, CheckCircle2 } from "lucide-react";

const STATUS_DESCRIPTIONS: Record<string, string> = {
  enquiry_received:
    "We've received your enquiry and will review it within 24 hours.",
  scoped:
    "We've defined the scope of work and will send you a proposal shortly.",
  documents_pending:
    "We're waiting for some documents from you before we can proceed with checks.",
  checks_in_progress:
    "Our professionals are actively working on your verification checks.",
  checks_complete:
    "All checks are complete. We're now preparing your report.",
  report_drafting:
    "We're compiling all findings into your final report.",
  report_delivered:
    "Your report is ready. You can view it below.",
  closed: "This case is now closed. Thank you for using Propersafe.",
};

const PROGRESS_STEPS = [
  { status: "enquiry_received", label: "Enquiry received" },
  { status: "scoped", label: "Scoped" },
  { status: "documents_pending", label: "Documents" },
  { status: "checks_in_progress", label: "Checks running" },
  { status: "checks_complete", label: "Checks complete" },
  { status: "report_drafting", label: "Report drafting" },
  { status: "report_delivered", label: "Report delivered" },
];

export default function ClientCaseView({
  caseData,
  userEmail,
}: {
  caseData: any;
  userEmail: string;
}) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState(caseData.documents || []);

  const currentStatus = caseData.status;
  const currentStepIndex = PROGRESS_STEPS.findIndex(
    (s) => s.status === currentStatus
  );

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const path = `${caseData.id}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(path, file);

    if (uploadError) {
      alert("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: docData, error: docError } = await supabase
      .from("documents")
      .insert({
        case_id: caseData.id,
        file_path: path,
        file_name: file.name,
        uploaded_by: "client",
      })
      .select()
      .single();

    setUploading(false);

    if (docError) {
      alert("Failed to save document record.");
    } else {
      setDocuments((prev: any[]) => [docData, ...prev]);
    }
  };

  const report = caseData.reports?.[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-xs text-[#6B6B6B]">
            {caseData.case_ref}
          </span>
          <span className="rounded-full bg-[#B8954F]/10 px-2 py-0.5 text-xs font-medium text-[#B8954F]">
            {SERVICE_LABELS[caseData.service_type as keyof typeof SERVICE_LABELS] ||
              caseData.service_type}
          </span>
        </div>
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">
          Your case status
        </h1>
        <p className="text-[#4A4A4A] mt-1">
          {STATUS_DESCRIPTIONS[currentStatus] || caseData.status}
        </p>
      </div>

      {/* Progress timeline */}
      <section className="rounded-lg border border-[#E8E6E1] bg-white p-5">
        <h2 className="text-sm font-semibold text-[#1A1A1A] mb-4">
          Progress
        </h2>
        <div className="relative">
          <div className="flex items-center justify-between">
            {PROGRESS_STEPS.map((step, index) => {
              const isComplete = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              return (
                <div key={step.status} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      isComplete
                        ? "bg-[#2D6A4F] text-white"
                        : isCurrent
                        ? "bg-[#B8954F] text-white"
                        : "bg-gray-100 text-[#6B6B6B]"
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span
                    className={`text-[10px] mt-1.5 text-center leading-tight ${
                      isCurrent ? "font-medium text-[#1A1A1A]" : "text-[#6B6B6B]"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Documents */}
      <section className="rounded-lg border border-[#E8E6E1] bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#1A1A1A]">Documents</h2>
          <label className="inline-flex items-center gap-1 rounded-md bg-[#B8954F] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#A68343] cursor-pointer">
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
          {documents.map((doc: any) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-md border border-[#E8E6E1] p-2.5"
            >
              <div className="flex items-center gap-2.5">
                {doc.file_name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <ImageIcon size={16} className="text-[#6B6B6B]" />
                ) : (
                  <FileText size={16} className="text-[#6B6B6B]" />
                )}
                <div>
                  <p className="text-sm text-[#1A1A1A]">{doc.file_name}</p>
                  <p className="text-[10px] text-[#6B6B6B]">
                    {DOC_TYPE_LABELS[doc.doc_type as keyof typeof DOC_TYPE_LABELS] ||
                      "Other"}{" "}
                    &middot; {format(new Date(doc.created_at), "dd MMM yyyy")}
                  </p>
                </div>
              </div>
              <a
                href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${doc.file_path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#B8954F] hover:text-[#A68343]"
              >
                View
              </a>
            </div>
          ))}
          {documents.length === 0 && (
            <p className="text-sm text-[#6B6B6B]">
              No documents uploaded yet.
            </p>
          )}
        </div>
      </section>

      {/* Status updates */}
      <section className="rounded-lg border border-[#E8E6E1] bg-white p-5">
        <h2 className="text-sm font-semibold text-[#1A1A1A] mb-4">
          Updates
        </h2>
        <div className="space-y-4">
          {(caseData.status_updates || []).map((update: any) => (
            <div key={update.id} className="flex gap-3">
              <div className="mt-0.5">
                <CheckCircle2 size={14} className="text-[#2D6A4F]" />
              </div>
              <div>
                <p className="text-sm text-[#1A1A1A]">
                  {CASE_STATUS_LABELS[
                    update.new_status as keyof typeof CASE_STATUS_LABELS
                  ] || update.new_status}
                </p>
                {update.notes && (
                  <p className="text-xs text-[#6B6B6B] mt-0.5">
                    {update.notes}
                  </p>
                )}
                <p className="text-[10px] text-[#6B6B6B] mt-1">
                  {formatDistanceToNow(new Date(update.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          ))}
          {(caseData.status_updates || []).length === 0 && (
            <p className="text-sm text-[#6B6B6B]">No updates yet.</p>
          )}
        </div>
      </section>

      {/* Report */}
      {currentStatus === "report_delivered" && report && (
        <section className="rounded-lg border border-[#2D6A4F]/20 bg-[#E8F5E9] p-5">
          <h2 className="text-sm font-semibold text-[#1A1A1A] mb-2">
            Your report is ready
          </h2>
          <p className="text-sm text-[#4A4A4A] mb-4">
            We&apos;ve completed all checks and compiled your report. You can
            view it below or download the PDF.
          </p>
          {report.final_content && (
            <div className="rounded-md border border-[#E8E6E1] bg-white p-4 mb-4">
              <div className="prose prose-sm max-w-none">
                <div
                  dangerouslySetInnerHTML={{
                    __html: report.final_content.replace(/\n/g, "<br/>"),
                  }}
                />
              </div>
            </div>
          )}
          {report.pdf_path && (
            <a
              href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${report.pdf_path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md bg-[#2D6A4F] px-4 py-2 text-sm font-medium text-white hover:bg-[#1f4d39]"
            >
              Download PDF
            </a>
          )}
        </section>
      )}
    </div>
  );
}
