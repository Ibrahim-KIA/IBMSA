const { CONFIG } = require("./courses");

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "onboarding@resend.dev";
const isDemo = !RESEND_API_KEY;

let resendClient = null;
if (!isDemo) {
  const { Resend } = require("resend");
  resendClient = new Resend(RESEND_API_KEY);
}

function nairaFromKobo(kobo) {
  return (kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 0 });
}

function confirmationEmailHtml({ fullName, courses, totalKobo, whatsappLink }) {
  const courseList = courses.map((c) => `<li>${c.name} (${c.duration})</li>`).join("");
  return `
  <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1f2937;">
    <h2 style="color: #1a7a3c;">You're registered! 🎉</h2>
    <p>Hi ${fullName},</p>
    <p>Thank you for registering for the <strong>IBM School Skill Acquisition Program — Batch B</strong>.
       Your payment of <strong>₦${nairaFromKobo(totalKobo)}</strong> has been received and your spot is confirmed for:</p>
    <ul>${courseList}</ul>
    <p><strong>Classes begin ${CONFIG.programStartDateLabel}</strong> at the IBM School premises.</p>
    <p style="background:#f0fdf4; border:1px solid #bbf7d0; padding:12px 16px; border-radius:8px;">
      Join the program WhatsApp group for updates and reminders:<br/>
      <a href="${whatsappLink}" style="color:#1a7a3c; font-weight:bold;">${whatsappLink}</a>
    </p>
    <p style="color:#6b7280; font-size: 14px;">
      Please note: a Certificate of Completion fee of ₦${nairaFromKobo(CONFIG.certificateFeeKobo)}
      will be required at the end of the program upon satisfactory assessment.
    </p>
    <p>See you in class!<br/>IBM School Skill Acquisition Program team</p>
  </div>`;
}

async function sendConfirmationEmail({ to, fullName, courses, totalKobo, whatsappLink }) {
  const html = confirmationEmailHtml({ fullName, courses, totalKobo, whatsappLink });
  if (isDemo) {
    console.log(`[DEMO MODE] Would send confirmation email to ${to}:\n${html}`);
    return { demo: true };
  }
  return resendClient.emails.send({
    from: EMAIL_FROM,
    to,
    subject: "You're registered — IBM School Skill Acquisition Program",
    html,
  });
}

async function sendBulkMessage({ recipients, subject, message }) {
  const html = `<div style="font-family: Arial, sans-serif; max-width: 560px; margin:0 auto; color:#1f2937; white-space: pre-wrap;">${message}</div>`;
  if (isDemo) {
    console.log(`[DEMO MODE] Would send "${subject}" to ${recipients.length} recipient(s).`);
    return { demo: true, sent: recipients.length };
  }
  let sent = 0;
  const failed = [];
  // Send one at a time with a short pause to stay well under provider rate limits.
  for (const to of recipients) {
    try {
      await resendClient.emails.send({ from: EMAIL_FROM, to, subject, html });
      sent += 1;
    } catch (err) {
      failed.push({ to, error: err.message });
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  return { demo: false, sent, failed };
}

module.exports = { isDemo, sendConfirmationEmail, sendBulkMessage };
