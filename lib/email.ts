import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.FROM_EMAIL || "hello@propersafe.ng";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "hello@propersafe.ng";

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
        <p style="margin:0 0 8px;font-size:15px;">Hi ${name},</p>
        <p style="margin:0 0 20px;font-size:15px;">We've received your enquiry. Here's what happens next:</p>
        
        <div style="background:#FAF9F6;border-radius:8px;padding:20px;margin-bottom:24px;">
          <p style="margin:0 0 4px;font-size:11px;color:#6B6B6B;letter-spacing:0.08em;text-transform:uppercase;">Reference</p>
          <p style="margin:0;font-size:22px;font-weight:600;font-family:Georgia,serif;color:#15120e;">${caseRef}</p>
          <p style="margin:12px 0 0;font-size:13px;color:#4A4A4A;">Service: ${service}</p>
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
        <p style="margin:4px 0 0;font-size:20px;font-weight:600;">${caseRef}</p>
      </div>
      <div style="padding:24px;background:#fff;border:1px solid #E8E6E1;border-top:none;border-radius:0 0 8px 8px;">
        <table style="width:100%;font-size:13px;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#6B6B6B;width:100px;">Name</td><td style="padding:6px 0;font-weight:500;">${name}</td></tr>
          <tr><td style="padding:6px 0;color:#6B6B6B;">Email</td><td style="padding:6px 0;"><a href="mailto:${email}" style="color:#15120e;">${email}</a></td></tr>
          ${whatsapp ? `<tr><td style="padding:6px 0;color:#6B6B6B;">WhatsApp</td><td style="padding:6px 0;">${whatsapp}</td></tr>` : ""}
          <tr><td style="padding:6px 0;color:#6B6B6B;">Service</td><td style="padding:6px 0;font-weight:500;">${service}</td></tr>
          ${urgency ? `<tr><td style="padding:6px 0;color:#6B6B6B;">Urgency</td><td style="padding:6px 0;">${urgency}</td></tr>` : ""}
        </table>
        ${situation ? `
        <div style="margin-top:16px;padding-top:16px;border-top:1px solid #E8E6E1;">
          <p style="margin:0 0 4px;font-size:11px;color:#6B6B6B;letter-spacing:0.08em;text-transform:uppercase;">Situation</p>
          <p style="margin:0;font-size:13px;color:#4A4A4A;white-space:pre-wrap;">${situation.replace(/</g, "&lt;")}</p>
        </div>
        ` : ""}
        <div style="margin-top:20px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://propersafe-production.up.railway.app"}/cases" style="display:inline-block;padding:10px 20px;background:#15120e;color:#F0EBE0;text-decoration:none;border-radius:6px;font-size:13px;font-weight:500;">View in dashboard →</a>
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
