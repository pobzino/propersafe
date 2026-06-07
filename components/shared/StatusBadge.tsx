"use client";

import {
  CaseStatus,
  CheckStatus,
  CASE_STATUS_LABELS,
  CHECK_STATUS_LABELS,
} from "@/lib/utils/checks";

const statusColors: Record<string, string> = {
  enquiry_received: "bg-gray-50 text-ink-muted border-gray-200",
  scoped: "bg-blue-50 text-blue-700 border-blue-200",
  documents_pending: "bg-amber-bg/40 text-amber border-amber/20",
  checks_in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  checks_complete: "bg-green-bg/50 text-green border-green/20",
  report_drafting: "bg-purple-50 text-purple-700 border-purple-200",
  report_delivered: "bg-green-bg/50 text-green border-green/20",
  closed: "bg-gray-50 text-ink-muted border-gray-200",
  not_started: "bg-gray-50 text-ink-muted border-gray-200",
  briefed: "bg-blue-50 text-blue-700 border-blue-200",
  in_progress: "bg-amber-bg/40 text-amber border-amber/20",
  complete: "bg-green-bg/50 text-green border-green/20",
  blocked: "bg-red-bg/40 text-red border-red/20",
  unpaid: "bg-red-bg/40 text-red border-red/20",
  paid: "bg-green-bg/50 text-green border-green/20",
  refunded: "bg-gray-50 text-ink-muted border-gray-200",
};

interface StatusBadgeProps {
  status: CaseStatus | CheckStatus | string;
  type?: "case" | "check" | "payment";
}

export default function StatusBadge({ status, type = "case" }: StatusBadgeProps) {
  const label =
    type === "check"
      ? CHECK_STATUS_LABELS[status as CheckStatus] || status
      : CASE_STATUS_LABELS[status as CaseStatus] || status;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        statusColors[status] || "bg-gray-50 text-ink-muted border-gray-200"
      }`}
    >
      {label}
    </span>
  );
}
