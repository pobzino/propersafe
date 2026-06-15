/**
 * Staff authorization.
 *
 * Internal dashboard access is gated to an allowlist of email addresses set in
 * the STAFF_EMAILS env var (comma-separated). There is no role column in the
 * database — staff are defined purely by this list, which keeps the boundary
 * server-side and out of any client-writable table.
 */
export function isStaff(email?: string | null): boolean {
  if (!email) return false;
  const allowlist = (process.env.STAFF_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowlist.includes(email.toLowerCase());
}
