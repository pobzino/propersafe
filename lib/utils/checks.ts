export const CHECK_TYPES = [
  "legal_review",
  "agis_search",
  "court_search",
  "coo_verification",
  "survey_check",
  "seller_authority",
  "qs_cost_review",
  "qs_invoice_review",
  "site_inspection",
] as const;

export type CheckType = (typeof CHECK_TYPES)[number];

export const CHECK_LABELS: Record<CheckType, string> = {
  legal_review: "Legal Review",
  agis_search: "AGIS Search",
  court_search: "Court Search",
  coo_verification: "C of O Verification",
  survey_check: "Survey Check",
  seller_authority: "Seller Authority",
  qs_cost_review: "QS Cost Review",
  qs_invoice_review: "QS Invoice Review",
  site_inspection: "Site Inspection",
};

export const SERVICE_TYPES = [
  "validity_check",
  "cost_preview",
  "payment_check",
] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];

export const SERVICE_LABELS: Record<ServiceType, string> = {
  validity_check: "Validity Check",
  cost_preview: "Cost Preview",
  payment_check: "Payment Check",
};

export const DEFAULT_CHECKS: Record<ServiceType, CheckType[]> = {
  validity_check: [
    "legal_review",
    "agis_search",
    "court_search",
    "coo_verification",
    "survey_check",
    "seller_authority",
  ],
  cost_preview: ["qs_cost_review"],
  payment_check: ["qs_invoice_review", "site_inspection"],
};

export const CASE_STATUSES = [
  "enquiry_received",
  "scoped",
  "documents_pending",
  "checks_in_progress",
  "checks_complete",
  "report_drafting",
  "report_delivered",
  "closed",
] as const;

export type CaseStatus = (typeof CASE_STATUSES)[number];

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  enquiry_received: "Enquiry Received",
  scoped: "Scoped",
  documents_pending: "Documents Pending",
  checks_in_progress: "Checks in Progress",
  checks_complete: "Checks Complete",
  report_drafting: "Report Drafting",
  report_delivered: "Report Delivered",
  closed: "Closed",
};

export const CHECK_STATUSES = [
  "not_started",
  "briefed",
  "in_progress",
  "complete",
  "blocked",
] as const;

export type CheckStatus = (typeof CHECK_STATUSES)[number];

export const CHECK_STATUS_LABELS: Record<CheckStatus, string> = {
  not_started: "Not Started",
  briefed: "Briefed",
  in_progress: "In Progress",
  complete: "Complete",
  blocked: "Blocked",
};

export const DOC_TYPES = [
  "coo",
  "roo",
  "survey_plan",
  "allocation_letter",
  "seller_id",
  "contract",
  "invoice",
  "photos",
  "scope_of_work",
  "other",
] as const;

export type DocType = (typeof DOC_TYPES)[number];

export const DOC_TYPE_LABELS: Record<DocType, string> = {
  coo: "C of O",
  roo: "R of O",
  survey_plan: "Survey Plan",
  allocation_letter: "Allocation Letter",
  seller_id: "Seller ID",
  contract: "Contract",
  invoice: "Invoice",
  photos: "Photos",
  scope_of_work: "Scope of Work",
  other: "Other",
};
