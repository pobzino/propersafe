import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.FROM_EMAIL || "hello@propersafe.ng";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "hello@propersafe.ng";
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://propersafe-production.up.railway.app";

function esc(value: string | null | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendEnquiryConfirmation(args: {
  to: string;
  name: string;
  caseRef: string;
  service: string;
}) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set, skipping confirmation email");
    return;
  }

  const { to, name, caseRef, service } = args;

  const html = `
    <div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;color:#15120e;line-height:1.6;">
      <div style="padding:32px 24px;border-bottom:1px solid #E8E6E1;">
        <p style="margin:0;font-size:13px;color:#A07840;letter-spacing:0.12em;text-transform:uppercase;">Propersafe</p>
      </div>
      <div style="padding:32px 24px;">
        <p style="margin:0 0 8px;font-size:15px;">Hi ${esc(name)},</p>
        <p style="margin:0 0 20px;font-size:15px;">We've received your enquiry. Here's what happens next:</p>

        <div style="background:#FAF9F6;border-radius:8px;padding:20px;margin-bottom:24px;">
          <p style="margin:0 0 4px;font-size:11px;color:#6B6B6B;letter-spacing:0.08em;text-transform:uppercase;">Reference</p>
          <p style="margin:0;font-size:22px;font-weight:600;font-family:Georgia,serif;color:#15120e;">${esc(caseRef)}</p>
          <p style="margin:12px 0 0;font-size:13px;color:#4A4A4A;">Service: ${esc(service)}</p>
        </div>

        <ol style="padding-left:20px;margin:0 0 24px;font-size:14px;color:#4A4A4A;">
          <li style="margin-bottom:8px;">We review your situation within <strong>24 hours</strong></li>
          <li style="margin-bottom:8px;">We confirm scope, timeline, and fees</li>
          <li style="margin-bottom:8px;">You decide whether to proceed</li>
          <li>We coordinate the checks and deliver your report</li>
        </ol>

        <p style="margin:0 0 4px;font-size:14px;">We'll reach out via email and WhatsApp.</p>
        <p style="margin:0;font-size:14px;color:#6B6B6B;">No payment is required at this stage.</p>
      </div>
      <div style="padding:20px 24px;border-top:1px solid #E8E6E1;font-size:12px;color:#6B6B6B;">
        <p style="margin:0;">Propersafe · Abuja property verification for diaspora Nigerians</p>
        <p style="margin:4px 0 0;"><a href="mailto:hello@propersafe.ng" style="color:#A07840;text-decoration:none;">hello@propersafe.ng</a></p>
      </div>
    </div>
  `;

  await resend.emails.send({
    from: `Propersafe <${FROM_EMAIL}>`,
    to,
    subject: `Enquiry received — ${caseRef}`,
    html,
  });
}

export async function sendAdminNotification(args: {
  caseRef: string;
  name: string;
  email: string;
  whatsapp?: string | null;
  service: string;
  situation?: string | null;
  urgency?: string | null;
}) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set, skipping admin notification");
    return;
  }

  const { caseRef, name, email, whatsapp, service, situation, urgency } = args;

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;color:#15120e;line-height:1.5;">
      <div style="padding:24px;background:#15120e;color:#F0EBE0;border-radius:8px 8px 0 0;">
        <p style="margin:0;font-size:12px;color:#C9A46A;letter-spacing:0.12em;text-transform:uppercase;">New Enquiry</p>
        <p style="margin:4px 0 0;font-size:20px;font-weight:600;">${esc(caseRef)}</p>
      </div>
      <div style="padding:24px;background:#fff;border:1px solid #E8E6E1;border-top:none;border-radius:0 0 8px 8px;">
        <table style="width:100%;font-size:13px;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#6B6B6B;width:100px;">Name</td><td style="padding:6px 0;font-weight:500;">${esc(name)}</td></tr>
          <tr><td style="padding:6px 0;color:#6B6B6B;">Email</td><td style="padding:6px 0;"><a href="mailto:${esc(email)}" style="color:#15120e;">${esc(email)}</a></td></tr>
          ${whatsapp ? `<tr><td style="padding:6px 0;color:#6B6B6B;">WhatsApp</td><td style="padding:6px 0;">${esc(whatsapp)}</td></tr>` : ""}
          <tr><td style="padding:6px 0;color:#6B6B6B;">Service</td><td style="padding:6px 0;font-weight:500;">${esc(service)}</td></tr>
          ${urgency ? `<tr><td style="padding:6px 0;color:#6B6B6B;">Urgency</td><td style="padding:6px 0;">${esc(urgency)}</td></tr>` : ""}
        </table>
        ${situation ? `
        <div style="margin-top:16px;padding-top:16px;border-top:1px solid #E8E6E1;">
          <p style="margin:0 0 4px;font-size:11px;color:#6B6B6B;letter-spacing:0.08em;text-transform:uppercase;">Situation</p>
          <p style="margin:0;font-size:13px;color:#4A4A4A;white-space:pre-wrap;">${esc(situation)}</p>
        </div>
        ` : ""}
        <div style="margin-top:20px;">
          <a href="${APP_URL}/cases" style="display:inline-block;padding:10px 20px;background:#15120e;color:#F0EBE0;text-decoration:none;border-radius:6px;font-size:13px;font-weight:500;">View in dashboard →</a>
        </div>
      </div>
    </div>
  `;

  await resend.emails.send({
    from: `Propersafe <${FROM_EMAIL}>`,
    to: ADMIN_EMAIL,
    subject: `New enquiry: ${caseRef} — ${name}`,
    html,
  });
}

export async function sendTriageConfirmation(args: {
  to: string;
  name: string;
  caseRef: string;
}) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set, skipping triage confirmation");
    return;
  }

  const { to, name, caseRef } = args;

  const html = `
    <div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;color:#15120e;line-height:1.6;">
      <div style="padding:32px 24px;border-bottom:1px solid #E8E6E1;">
        <p style="margin:0;font-size:13px;color:#A07840;letter-spacing:0.12em;text-transform:uppercase;">Propersafe</p>
      </div>
      <div style="padding:32px 24px;">
        <p style="margin:0 0 8px;font-size:15px;">Hi ${esc(name)},</p>
        <p style="margin:0 0 20px;font-size:15px;">We've received your risk analysis request. A Propersafe specialist is reviewing your situation now.</p>

        <div style="background:#FAF9F6;border-radius:8px;padding:20px;margin-bottom:24px;">
          <p style="margin:0 0 4px;font-size:11px;color:#6B6B6B;letter-spacing:0.08em;text-transform:uppercase;">Reference</p>
          <p style="margin:0;font-size:22px;font-weight:600;font-family:Georgia,serif;color:#15120e;">${esc(caseRef)}</p>
        </div>

        <ol style="padding-left:20px;margin:0 0 24px;font-size:14px;color:#4A4A4A;">
          <li style="margin-bottom:8px;">A specialist reviews your answers and any documents you uploaded within <strong>24 hours</strong></li>
          <li style="margin-bottom:8px;">We send you a short note confirming what should be verified before any money moves</li>
          <li>If you want us to run the checks, we confirm scope, timeline, and fees — you decide</li>
        </ol>

        <p style="margin:0;font-size:14px;color:#6B6B6B;">This analysis is free. No payment is required at this stage.</p>
      </div>
      <div style="padding:20px 24px;border-top:1px solid #E8E6E1;font-size:12px;color:#6B6B6B;">
        <p style="margin:0;">Propersafe · Abuja property verification for diaspora Nigerians</p>
        <p style="margin:4px 0 0;"><a href="mailto:hello@propersafe.ng" style="color:#A07840;text-decoration:none;">hello@propersafe.ng</a></p>
      </div>
    </div>
  `;

  await resend.emails.send({
    from: `Propersafe <${FROM_EMAIL}>`,
    to,
    subject: `Risk analysis request received — ${caseRef}`,
    html,
  });
}

export async function sendTriageNotification(args: {
  name: string;
  email: string;
  caseRef: string;
  riskLevel?: string | null;
  score?: number | null;
  uploadedFiles?: string[];
  details: {
    intent: string;
    location: string;
    received: string[];
    urgency: string;
    worries: string[];
  };
}) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set, skipping triage notification");
    return;
  }

  const { name, email, caseRef, riskLevel, score, uploadedFiles, details } = args;

  const riskColor =
    riskLevel === "High" ? "#bb553c" : riskLevel === "Moderate" ? "#e2b545" : "#78c878";

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;color:#15120e;line-height:1.5;">
      <div style="padding:24px;background:#15120e;color:#F0EBE0;border-radius:8px 8px 0 0;">
        <p style="margin:0;font-size:12px;color:#C9A46A;letter-spacing:0.12em;text-transform:uppercase;">Risk Analysis Lead</p>
        <p style="margin:4px 0 0;font-size:20px;font-weight:600;">${esc(caseRef)} — ${esc(name)}</p>
        ${riskLevel ? `<p style="margin:6px 0 0;font-size:14px;">Indicative risk: <strong style="color:${riskColor}">${esc(riskLevel)}</strong>${score != null ? ` (score ${esc(String(score))})` : ""}</p>` : ""}
      </div>
      <div style="padding:24px;background:#fff;border:1px solid #E8E6E1;border-top:none;border-radius:0 0 8px 8px;">
        <table style="width:100%;font-size:13px;border-collapse:collapse;margin-bottom:20px;">
          <tr><td style="padding:6px 0;color:#6B6B6B;width:120px;">Email</td><td style="padding:6px 0;"><a href="mailto:${esc(email)}" style="color:#15120e;">${esc(email)}</a></td></tr>
          <tr><td style="padding:6px 0;color:#6B6B6B;">Intent</td><td style="padding:6px 0;font-weight:500;">${esc(details.intent)}</td></tr>
          <tr><td style="padding:6px 0;color:#6B6B6B;">Location</td><td style="padding:6px 0;font-weight:500;">${esc(details.location)}</td></tr>
          <tr><td style="padding:6px 0;color:#6B6B6B;">Urgency</td><td style="padding:6px 0;font-weight:500;color:#bb553c;">${esc(details.urgency)}</td></tr>
        </table>

        <div style="border-top:1px solid #E8E6E1;padding-top:16px;margin-bottom:16px;">
          <p style="margin:0 0 8px;font-size:11px;color:#6B6B6B;letter-spacing:0.08em;text-transform:uppercase;">Documents Received (self-reported)</p>
          <ul style="margin:0;padding-left:18px;font-size:13px;color:#4A4A4A;">
            ${details.received.length ? details.received.map((item) => `<li style="margin-bottom:4px;">${esc(item)}</li>`).join("") : "<li>None</li>"}
          </ul>
        </div>

        <div style="border-top:1px solid #E8E6E1;padding-top:16px;margin-bottom:16px;">
          <p style="margin:0 0 8px;font-size:11px;color:#6B6B6B;letter-spacing:0.08em;text-transform:uppercase;">Primary Concerns</p>
          <ul style="margin:0;padding-left:18px;font-size:13px;color:#4A4A4A;">
            ${details.worries.length ? details.worries.map((item) => `<li style="margin-bottom:4px;">${esc(item)}</li>`).join("") : "<li>None</li>"}
          </ul>
        </div>

        ${uploadedFiles && uploadedFiles.length ? `
        <div style="border-top:1px solid #E8E6E1;padding-top:16px;">
          <p style="margin:0 0 8px;font-size:11px;color:#6B6B6B;letter-spacing:0.08em;text-transform:uppercase;">Files Uploaded (${uploadedFiles.length})</p>
          <ul style="margin:0;padding-left:18px;font-size:13px;color:#4A4A4A;">
            ${uploadedFiles.map((f) => `<li style="margin-bottom:4px;">${esc(f)}</li>`).join("")}
          </ul>
        </div>
        ` : ""}

        <div style="margin-top:24px;">
          <a href="${APP_URL}/cases" style="display:inline-block;padding:10px 20px;background:#15120e;color:#F0EBE0;text-decoration:none;border-radius:6px;font-size:13px;font-weight:500;">Open Dashboard →</a>
        </div>
      </div>
    </div>
  `;

  await resend.emails.send({
    from: `Propersafe Triage <${FROM_EMAIL}>`,
    to: ADMIN_EMAIL,
    subject: `New risk analysis: ${details.intent} — ${name} (${caseRef})`,
    html,
  });
}
