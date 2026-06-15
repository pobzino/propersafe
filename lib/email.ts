import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.FROM_EMAIL || "hello@propersafe.co";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "hello@propersafe.co";
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://propersafe-production.up.railway.app";

// Brand assets are always served from the production domain, regardless of APP_URL.
const BRAND_URL = "https://propersafe.co";

function esc(value: string | null | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Shared "Premium dark banner" shell ──────────────────────────────────────
// Dark header band with the cream logo + gold rule, light serif body, gold CTA.

function emailDoc(inner: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
  <body style="margin:0;background:#EDE7DB;padding:32px 12px;font-family:Georgia,'Times New Roman',serif;-webkit-font-smoothing:antialiased;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 8px 30px rgba(21,18,14,0.12);">
      ${inner}
    </div>
  </body></html>`;
}

function banner(opts: { eyebrow?: string; title?: string; subtitle?: string } = {}): string {
  const { eyebrow, title, subtitle } = opts;
  const hasText = eyebrow || title || subtitle;
  return `<div style="background:#15120e;padding:32px 24px 26px;text-align:center;">
    <img src="${BRAND_URL}/logo-dark.png" alt="Propersafe" width="168" height="49" style="display:inline-block;border:0;outline:none;text-decoration:none;height:49px;width:168px;">
    <div style="height:1px;background:linear-gradient(90deg,rgba(160,120,64,0),#A07840,rgba(160,120,64,0));margin:24px auto ${hasText ? "18px" : "0"};max-width:260px;"></div>
    ${eyebrow ? `<p style="margin:0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46A;">${eyebrow}</p>` : ""}
    ${title ? `<p style="margin:6px 0 0;font-size:22px;font-weight:600;color:#F0EBE0;">${title}</p>` : ""}
    ${subtitle ? `<p style="margin:8px 0 0;font-size:14px;color:#C9A46A;">${subtitle}</p>` : ""}
  </div>`;
}

function goldButton(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#A07840;color:#ffffff;text-decoration:none;font-size:15px;padding:14px 30px;border-radius:8px;">${label}</a>`;
}

function footer(): string {
  return `<div style="padding:24px 38px 32px;border-top:1px solid #ECE9E3;font-size:12px;color:#9a948a;line-height:1.7;">
    Propersafe · Abuja property verification for diaspora Nigerians<br>
    <a href="mailto:hello@propersafe.co" style="color:#A07840;text-decoration:none;">hello@propersafe.co</a>
  </div>`;
}

function bullet(text: string): string {
  return `<p style="margin:0 0 13px;"><span style="color:#A07840;">▸</span>&nbsp;&nbsp;${text}</p>`;
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

  const html = emailDoc(`
    ${banner()}
    <div style="padding:38px 38px 6px;color:#15120e;line-height:1.6;">
      <p style="margin:0 0 10px;font-size:16px;">Hi ${esc(name)},</p>
      <p style="margin:0 0 28px;font-size:16px;color:#3f3a33;">We've received your enquiry — here's what happens next.</p>
      <p style="margin:0 0 2px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#A07840;">Your reference</p>
      <p style="margin:0 0 4px;font-size:36px;font-weight:600;color:#15120e;">${esc(caseRef)}</p>
      <p style="margin:0 0 30px;font-size:14px;color:#6B6B6B;">${esc(service)}</p>
      <div style="font-size:15.5px;color:#3f3a33;">
        ${bullet("We review your situation within <strong>24 hours</strong>")}
        ${bullet("We confirm scope, timeline &amp; fees")}
        ${bullet("You decide whether to proceed")}
        ${bullet("We coordinate the checks and deliver your report")}
      </div>
      <div style="margin:32px 0 6px;">${goldButton(`${APP_URL}/client-login`, "Track your case&nbsp;&rarr;")}</div>
      <p style="margin:20px 0 0;font-size:13px;color:#8a8378;">We'll reach out via email and WhatsApp. No payment is required at this stage.</p>
    </div>
    ${footer()}
  `);

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

  const html = emailDoc(`
    ${banner({ eyebrow: "New Enquiry", title: esc(caseRef) })}
    <div style="padding:32px 38px 8px;color:#15120e;line-height:1.5;">
      <table style="width:100%;font-size:14px;border-collapse:collapse;">
        <tr><td style="padding:7px 0;color:#9a948a;width:110px;">Name</td><td style="padding:7px 0;font-weight:600;">${esc(name)}</td></tr>
        <tr><td style="padding:7px 0;color:#9a948a;">Email</td><td style="padding:7px 0;"><a href="mailto:${esc(email)}" style="color:#A07840;text-decoration:none;">${esc(email)}</a></td></tr>
        ${whatsapp ? `<tr><td style="padding:7px 0;color:#9a948a;">WhatsApp</td><td style="padding:7px 0;">${esc(whatsapp)}</td></tr>` : ""}
        <tr><td style="padding:7px 0;color:#9a948a;">Service</td><td style="padding:7px 0;font-weight:600;">${esc(service)}</td></tr>
        ${urgency ? `<tr><td style="padding:7px 0;color:#9a948a;">Urgency</td><td style="padding:7px 0;">${esc(urgency)}</td></tr>` : ""}
      </table>
      ${situation ? `
      <div style="margin-top:18px;padding-top:18px;border-top:1px solid #ECE9E3;">
        <p style="margin:0 0 6px;font-size:11px;color:#A07840;letter-spacing:0.1em;text-transform:uppercase;">Situation</p>
        <p style="margin:0;font-size:14px;color:#3f3a33;white-space:pre-wrap;">${esc(situation)}</p>
      </div>` : ""}
      <div style="margin:30px 0 6px;">${goldButton(`${APP_URL}/cases`, "View in dashboard&nbsp;&rarr;")}</div>
    </div>
    ${footer()}
  `);

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

  const html = emailDoc(`
    ${banner()}
    <div style="padding:38px 38px 6px;color:#15120e;line-height:1.6;">
      <p style="margin:0 0 10px;font-size:16px;">Hi ${esc(name)},</p>
      <p style="margin:0 0 28px;font-size:16px;color:#3f3a33;">We've received your risk analysis request. A Propersafe specialist is reviewing your situation now.</p>
      <p style="margin:0 0 2px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#A07840;">Your reference</p>
      <p style="margin:0 0 30px;font-size:36px;font-weight:600;color:#15120e;">${esc(caseRef)}</p>
      <div style="font-size:15.5px;color:#3f3a33;">
        ${bullet("A specialist reviews your answers and any documents within <strong>24 hours</strong>")}
        ${bullet("We send a short note on what to verify before any money moves")}
        ${bullet("If you want us to run the checks, we confirm scope, timeline &amp; fees — you decide")}
      </div>
      <div style="margin:32px 0 6px;">${goldButton(APP_URL, "Visit Propersafe&nbsp;&rarr;")}</div>
      <p style="margin:20px 0 0;font-size:13px;color:#8a8378;">This analysis is free. No payment is required at this stage.</p>
    </div>
    ${footer()}
  `);

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
    riskLevel === "High" ? "#df8b7c" : riskLevel === "Moderate" ? "#e2b545" : "#9bd0a3";
  const riskSubtitle = riskLevel
    ? `Indicative risk: <strong style="color:${riskColor};">${esc(riskLevel)}</strong>${score != null ? ` (score ${esc(String(score))})` : ""}`
    : undefined;

  const listBlock = (label: string, items: string[]) => `
    <div style="margin-top:18px;padding-top:18px;border-top:1px solid #ECE9E3;">
      <p style="margin:0 0 8px;font-size:11px;color:#A07840;letter-spacing:0.1em;text-transform:uppercase;">${label}</p>
      <ul style="margin:0;padding-left:18px;font-size:14px;color:#3f3a33;">
        ${items.length ? items.map((i) => `<li style="margin-bottom:5px;">${esc(i)}</li>`).join("") : "<li>None</li>"}
      </ul>
    </div>`;

  const html = emailDoc(`
    ${banner({ eyebrow: "Risk Analysis Lead", title: `${esc(caseRef)} — ${esc(name)}`, subtitle: riskSubtitle })}
    <div style="padding:32px 38px 8px;color:#15120e;line-height:1.5;">
      <table style="width:100%;font-size:14px;border-collapse:collapse;">
        <tr><td style="padding:7px 0;color:#9a948a;width:110px;">Email</td><td style="padding:7px 0;"><a href="mailto:${esc(email)}" style="color:#A07840;text-decoration:none;">${esc(email)}</a></td></tr>
        <tr><td style="padding:7px 0;color:#9a948a;">Intent</td><td style="padding:7px 0;font-weight:600;">${esc(details.intent)}</td></tr>
        <tr><td style="padding:7px 0;color:#9a948a;">Location</td><td style="padding:7px 0;font-weight:600;">${esc(details.location)}</td></tr>
        <tr><td style="padding:7px 0;color:#9a948a;">Urgency</td><td style="padding:7px 0;font-weight:600;">${esc(details.urgency)}</td></tr>
      </table>
      ${listBlock("Documents received (self-reported)", details.received)}
      ${listBlock("Primary concerns", details.worries)}
      ${uploadedFiles && uploadedFiles.length ? listBlock(`Files uploaded (${uploadedFiles.length})`, uploadedFiles) : ""}
      <div style="margin:30px 0 6px;">${goldButton(`${APP_URL}/cases`, "Open dashboard&nbsp;&rarr;")}</div>
    </div>
    ${footer()}
  `);

  await resend.emails.send({
    from: `Propersafe Triage <${FROM_EMAIL}>`,
    to: ADMIN_EMAIL,
    subject: `New risk analysis: ${details.intent} — ${name} (${caseRef})`,
    html,
  });
}
