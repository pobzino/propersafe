-- Initial schema for Propersafe v1.0

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  whatsapp TEXT,
  location TEXT,
  notes TEXT
);

-- Professionals table
CREATE TABLE professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  specialism TEXT NOT NULL, -- lawyer, QS, surveyor, inspector
  email TEXT,
  whatsapp TEXT,
  active BOOLEAN DEFAULT TRUE,
  notes TEXT
);

-- Cases table
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  case_ref TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES clients(id),
  coordinator_id UUID REFERENCES professionals(id),
  service_type TEXT NOT NULL, -- validity_check | cost_preview | payment_check
  property_location TEXT,
  property_type TEXT, -- land | flat | duplex | built_property
  status TEXT NOT NULL DEFAULT 'enquiry_received',
  -- statuses: enquiry_received | scoped | documents_pending |
  --           checks_in_progress | checks_complete |
  --           report_drafting | report_delivered | closed
  payment_status TEXT DEFAULT 'unpaid', -- unpaid | paid | refunded
  payment_amount NUMERIC,
  stripe_payment_intent TEXT,
  deadline DATE,
  intake_notes TEXT,
  client_concern TEXT,
  ai_package_recommendation TEXT,
  internal_notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Checks table
CREATE TABLE checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  check_type TEXT NOT NULL,
  -- types: legal_review | agis_search | court_search |
  --        coo_verification | survey_check | seller_authority |
  --        qs_cost_review | qs_invoice_review | site_inspection
  status TEXT NOT NULL DEFAULT 'not_started',
  -- statuses: not_started | briefed | in_progress | complete | blocked
  assigned_to UUID REFERENCES professionals(id),
  brief_sent_at TIMESTAMPTZ,
  findings TEXT,
  findings_doc_path TEXT,
  due_date DATE,
  blocked_reason TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  doc_type TEXT,
  -- types: coo | roo | survey_plan | allocation_letter | seller_id |
  --        contract | invoice | photos | scope_of_work | other
  uploaded_by TEXT, -- client | coordinator | professional
  notes TEXT
);

-- Status updates table
CREATE TABLE status_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  triggered_by TEXT, -- human | system | ai
  actor_id UUID,
  message_sent TEXT,
  notes TEXT
);

-- Reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  case_id UUID REFERENCES cases(id),
  draft_content TEXT,
  final_content TEXT,
  verdict TEXT, -- proceed | pause | avoid | release | partial_release | hold
  pdf_path TEXT,
  drafted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  approved_by UUID
);

-- Indexes
CREATE INDEX idx_cases_client_id ON cases(client_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_checks_case_id ON checks(case_id);
CREATE INDEX idx_documents_case_id ON documents(case_id);
CREATE INDEX idx_status_updates_case_id ON status_updates(case_id);

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Internal users have full access (handled by application logic + service role)
-- Clients can only read their own data
CREATE POLICY "clients_read_own" ON clients
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "cases_read_own" ON cases
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "checks_read_own" ON checks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM cases WHERE cases.id = checks.case_id AND cases.client_id = auth.uid())
  );

CREATE POLICY "documents_read_own" ON documents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM cases WHERE cases.id = documents.case_id AND cases.client_id = auth.uid())
  );

CREATE POLICY "status_updates_read_own" ON status_updates
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM cases WHERE cases.id = status_updates.case_id AND cases.client_id = auth.uid())
  );

CREATE POLICY "reports_read_own" ON reports
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM cases WHERE cases.id = reports.case_id AND cases.client_id = auth.uid())
  );

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cases_updated_at BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER checks_updated_at BEFORE UPDATE ON checks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
