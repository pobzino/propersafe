-- Update RLS policies to allow client access based on email matching
-- This is needed because clients sign up via magic link after their case is created,
-- so their auth.uid() won't match the clients.id UUID.

DROP POLICY IF EXISTS "clients_read_own" ON clients;
DROP POLICY IF EXISTS "cases_read_own" ON cases;
DROP POLICY IF EXISTS "checks_read_own" ON checks;
DROP POLICY IF EXISTS "documents_read_own" ON documents;
DROP POLICY IF EXISTS "status_updates_read_own" ON status_updates;
DROP POLICY IF EXISTS "reports_read_own" ON reports;

-- Clients can read their own record by email
CREATE POLICY "clients_read_own" ON clients
  FOR SELECT USING (email = auth.jwt() ->> 'email');

-- Clients can read their own cases by email
CREATE POLICY "cases_read_own" ON cases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = cases.client_id
      AND clients.email = auth.jwt() ->> 'email'
    )
  );

-- Clients can read checks for their cases
CREATE POLICY "checks_read_own" ON checks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases
      JOIN clients ON clients.id = cases.client_id
      WHERE cases.id = checks.case_id
      AND clients.email = auth.jwt() ->> 'email'
    )
  );

-- Clients can read documents for their cases
CREATE POLICY "documents_read_own" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases
      JOIN clients ON clients.id = cases.client_id
      WHERE cases.id = documents.case_id
      AND clients.email = auth.jwt() ->> 'email'
    )
  );

-- Clients can read status updates for their cases
CREATE POLICY "status_updates_read_own" ON status_updates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases
      JOIN clients ON clients.id = cases.client_id
      WHERE cases.id = status_updates.case_id
      AND clients.email = auth.jwt() ->> 'email'
    )
  );

-- Clients can read reports for their cases
CREATE POLICY "reports_read_own" ON reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases
      JOIN clients ON clients.id = cases.client_id
      WHERE cases.id = reports.case_id
      AND clients.email = auth.jwt() ->> 'email'
    )
  );

-- Clients can insert documents for their cases
CREATE POLICY "documents_insert_own" ON documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cases
      JOIN clients ON clients.id = cases.client_id
      WHERE cases.id = documents.case_id
      AND clients.email = auth.jwt() ->> 'email'
    )
  );
