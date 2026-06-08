import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

const client =
  accountSid && authToken ? twilio(accountSid, authToken) : null;

export async function sendEnquiryConfirmationWhatsApp(args: {
  to: string;
  name: string;
  caseRef: string;
}) {
  if (!client || !fromNumber) {
    console.warn(
      "[whatsapp] Twilio credentials not set, skipping WhatsApp message"
    );
    return;
  }

  const { to, name, caseRef } = args;

  // Normalize to E.164 with whatsapp: prefix
  const toFormatted = to.startsWith("+")
    ? `whatsapp:${to}`
    : `whatsapp:+${to.replace(/\D/g, "")}`;
  const fromFormatted = fromNumber.startsWith("+")
    ? `whatsapp:${fromNumber}`
    : `whatsapp:+${fromNumber.replace(/\D/g, "")}`;

  const body =
    `Hi ${name}, we've received your Propersafe enquiry.\n\n` +
    `Reference: ${caseRef}\n\n` +
    `We'll review your situation and come back within 24 hours with scope, timeline, and fees.\n\n` +
    `No payment is required at this stage.`;

  await client.messages.create({
    from: fromFormatted,
    to: toFormatted,
    body,
  });
}
