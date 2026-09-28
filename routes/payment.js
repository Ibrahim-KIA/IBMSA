const express = require("express");
const multer = require("multer");
const { getCourseById, CONFIG } = require("../src/courses");
const db = require("../src/db");
const paystack = require("../src/paystack");
const email = require("../src/email");
const { PAYMENT_METHOD, BANK_DETAILS } = require("../src/payment-config");

const router = express.Router();

const ALLOWED_RECEIPT_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB raw cap — images are compressed client-side well below this
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_RECEIPT_TYPES.has(file.mimetype)) {
      return cb(new Error("Please upload a JPEG/PNG/WebP image or a PDF."));
    }
    cb(null, true);
  },
});

async function confirmAndNotify(registration) {
  if (registration.status === "paid" && registration.confirmation_email_sent_at) {
    return registration; // already handled — nothing more to do
  }
  const updated = await db.markRegistrationPaid(registration.paystack_reference);
  if (updated && !updated.confirmation_email_sent_at) {
    const courses = updated.course_ids.map((id) => getCourseById(id)).filter(Boolean);
    await email.sendConfirmationEmail({
      to: updated.email,
      fullName: updated.full_name,
      courses,
      totalKobo: updated.total_kobo,
      whatsappLink: process.env.WHATSAPP_GROUP_LINK,
    });
    await db.markConfirmationEmailSent(updated.paystack_reference);
    updated.confirmation_email_sent_at = new Date().toISOString();
  }
  return updated;
}

// Called by the browser right after Paystack redirects back to us.
router.get("/verify", async (req, res) => {
  try {
    const { reference } = req.query;
    if (!reference) return res.status(400).json({ error: "Missing reference." });

    const registration = await db.getRegistrationByReference(reference);
    if (!registration) return res.status(404).json({ error: "Registration not found." });

    if (registration.status !== "paid") {
      if (PAYMENT_METHOD === "bank_transfer") {
        // Nothing to check with a provider — only the admin marking it paid
        // (after seeing the transfer land) moves this forward.
        return res.json({
          status: "awaiting_bank_transfer",
          reference,
          totalKobo: registration.total_kobo,
          bank: BANK_DETAILS,
          hasReceipt: !!registration.has_receipt,
        });
      }
      const result = await paystack.verifyTransaction(reference);
      if (!result.success) {
        return res.json({ status: "not_paid" });
      }
      // Amount actually charged must match what we asked for.
      if (!result.demo && result.amountKobo !== registration.total_kobo) {
        return res.status(400).json({ error: "Payment amount mismatch — please contact us." });
      }
    }

    const updated = await confirmAndNotify(registration);
    const courses = updated.course_ids.map((id) => getCourseById(id)).filter(Boolean);
    res.json({
      status: "paid",
      fullName: updated.full_name,
      courses: courses.map((c) => ({ name: c.name, duration: c.duration })),
      totalKobo: updated.total_kobo,
      startDateLabel: CONFIG.programStartDateLabel,
      whatsappLink: process.env.WHATSAPP_GROUP_LINK,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Could not verify payment." });
  }
});

// Lets a registrant upload proof of a bank transfer so the admin can match
// it to their name/amount faster. Purely a convenience for tracking — a spot
// is only ever confirmed by the admin's own "Mark Paid" click, never by this.
router.post("/upload-receipt", (req, res) => {
  upload.single("receipt")(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message || "Upload failed." });
    try {
      const { reference } = req.body;
      if (!reference) return res.status(400).json({ error: "Missing reference." });
      if (!req.file) return res.status(400).json({ error: "No file received." });

      const registration = await db.getRegistrationByReference(reference);
      if (!registration) return res.status(404).json({ error: "Registration not found." });

      await db.saveReceipt(reference, req.file.buffer, req.file.mimetype);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message || "Upload failed." });
    }
  });
});

// Called directly by Paystack's servers — the authoritative confirmation path.
// Mounted with express.raw() in server.js so we can check the signature
// against the exact raw bytes Paystack sent.
router.post("/webhooks/paystack", async (req, res) => {
  try {
    const signature = req.headers["x-paystack-signature"];
    const valid = paystack.verifyWebhookSignature(req.body, signature);
    if (!valid) return res.status(401).send("Invalid signature");

    const event = JSON.parse(req.body.toString("utf8"));
    if (event.event === "charge.success") {
      const reference = event.data.reference;
      const registration = await db.getRegistrationByReference(reference);
      if (registration && event.data.amount === registration.total_kobo) {
        await confirmAndNotify(registration);
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.sendStatus(200); // acknowledge anyway so Paystack doesn't hammer retries on our bug
  }
});

module.exports = router;
module.exports.confirmAndNotify = confirmAndNotify;
