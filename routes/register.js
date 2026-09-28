const express = require("express");
const crypto = require("crypto");
const { COURSES, CONFIG, computeTotals } = require("../src/courses");
const db = require("../src/db");
const paystack = require("../src/paystack");
const { PAYMENT_METHOD, BANK_DETAILS } = require("../src/payment-config");

const router = express.Router();

router.get("/courses", (req, res) => {
  res.json({ courses: COURSES, config: { ...CONFIG, paymentMethod: PAYMENT_METHOD } });
});

function normalizePhone(raw) {
  const digits = String(raw || "").replace(/[^\d]/g, "");
  if (digits.startsWith("234")) return `+${digits}`;
  if (digits.startsWith("0")) return `+234${digits.slice(1)}`;
  if (digits.length === 10) return `+234${digits}`;
  return `+${digits}`;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ""));
}

router.post("/register", async (req, res) => {
  try {
    const { fullName, email, whatsapp, address, kinName, kinPhone, courseIds, agree } = req.body || {};

    const missing = [];
    if (!fullName || !String(fullName).trim()) missing.push("Full Name");
    if (!isValidEmail(email)) missing.push("a valid Email Address");
    if (!whatsapp || !String(whatsapp).trim()) missing.push("WhatsApp Number");
    if (!address || !String(address).trim()) missing.push("Home Address");
    if (!kinName || !String(kinName).trim()) missing.push("Next of Kin Name");
    if (!kinPhone || !String(kinPhone).trim()) missing.push("Next of Kin Phone Number");
    if (!Array.isArray(courseIds) || courseIds.length === 0) missing.push("at least one course");
    if (agree !== true) missing.push("agreement to the certificate fee terms");

    if (missing.length) {
      return res.status(400).json({ error: `Please provide: ${missing.join(", ")}.` });
    }

    // Prices come ONLY from the server's course list — never from the browser.
    const totals = computeTotals(courseIds);

    const reference = `IBMSA-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

    await db.insertRegistration({
      full_name: String(fullName).trim(),
      email: String(email).trim().toLowerCase(),
      whatsapp: normalizePhone(whatsapp),
      address: String(address).trim(),
      kin_name: String(kinName).trim(),
      kin_phone: normalizePhone(kinPhone),
      course_ids: totals.courses.map((c) => c.id),
      subtotal_kobo: totals.subtotalKobo,
      reg_fee_kobo: totals.regFeeKobo,
      discount_kobo: totals.discountKobo,
      total_kobo: totals.totalKobo,
      paystack_reference: reference,
    });

    if (PAYMENT_METHOD === "bank_transfer") {
      // No external payment provider — the school confirms each transfer by
      // hand in the admin panel. Nothing is marked paid automatically.
      return res.json({
        paymentMethod: "bank_transfer",
        reference,
        totalKobo: totals.totalKobo,
        bank: BANK_DETAILS,
      });
    }

    const { authorizationUrl } = await paystack.initializeTransaction({
      email: String(email).trim().toLowerCase(),
      amountKobo: totals.totalKobo,
      reference,
      callbackUrl: `${process.env.BASE_URL}/success.html?reference=${reference}`,
      metadata: { fullName, courseIds: totals.courses.map((c) => c.id) },
    });

    res.json({ paymentMethod: "paystack", authorizationUrl, reference });
  } catch (err) {
    res.status(400).json({ error: err.message || "Registration failed." });
  }
});

module.exports = router;
