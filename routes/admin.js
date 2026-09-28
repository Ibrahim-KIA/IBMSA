const express = require("express");
const { COURSES, getCourseById } = require("../src/courses");
const db = require("../src/db");
const emailer = require("../src/email");
const auth = require("../src/auth");
const { confirmAndNotify } = require("./payment");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  const ok = await auth.verifyLogin(email, password);
  if (!ok) return res.status(401).json({ error: "Wrong email or password." });
  auth.issueSessionCookie(res);
  res.json({ ok: true });
});

router.post("/logout", (req, res) => {
  auth.clearSessionCookie(res);
  res.json({ ok: true });
});

router.get("/me", auth.requireAdmin, (req, res) => res.json({ ok: true }));

router.get("/registrations", auth.requireAdmin, async (req, res) => {
  const { status, course } = req.query;
  const rows = await db.listRegistrations({ status, courseId: course });

  const summary = {};
  for (const c of COURSES) summary[c.id] = { name: c.name, paid: 0, pending: 0 };
  const allRows = await db.listRegistrations({});
  const totals = { paid: 0, pending: 0 };
  for (const row of allRows) {
    if (row.status === "paid") totals.paid += 1;
    else if (row.status === "pending") totals.pending += 1;
    for (const id of row.course_ids) {
      if (!summary[id]) continue;
      if (row.status === "paid") summary[id].paid += 1;
      else if (row.status === "pending") summary[id].pending += 1;
    }
  }

  res.json({
    totals,
    registrations: rows.map((r) => ({
      id: r.id,
      reference: r.paystack_reference,
      fullName: r.full_name,
      email: r.email,
      whatsapp: r.whatsapp,
      address: r.address,
      kinName: r.kin_name,
      kinPhone: r.kin_phone,
      courses: r.course_ids.map((id) => getCourseById(id)?.name || id),
      totalKobo: r.total_kobo,
      status: r.status,
      createdAt: r.created_at,
      paidAt: r.paid_at,
    })),
    summary,
  });
});

router.get("/export.csv", auth.requireAdmin, async (req, res) => {
  const rows = await db.listRegistrations({ status: "paid" });
  const header = "Full Name,Email,WhatsApp,Address,Next of Kin,Kin Phone,Courses,Total (NGN),Paid At\n";
  const body = rows
    .map((r) => {
      const courses = r.course_ids.map((id) => getCourseById(id)?.name || id).join(" | ");
      const total = (r.total_kobo / 100).toFixed(0);
      const esc = (v) => `"${String(v || "").replace(/"/g, '""')}"`;
      return [esc(r.full_name), esc(r.email), esc(r.whatsapp), esc(r.address), esc(r.kin_name), esc(r.kin_phone), esc(courses), total, esc(r.paid_at)].join(",");
    })
    .join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=registrations.csv");
  res.send(header + body);
});

router.post("/mark-paid", auth.requireAdmin, async (req, res) => {
  const { reference } = req.body || {};
  if (!reference) return res.status(400).json({ error: "Missing reference." });
  const registration = await db.getRegistrationByReference(reference);
  if (!registration) return res.status(404).json({ error: "Registration not found." });
  if (registration.status === "paid") return res.json({ ok: true, alreadyPaid: true });
  await confirmAndNotify(registration);
  res.json({ ok: true });
});

router.post("/message", auth.requireAdmin, async (req, res) => {
  const { courseId, subject, message } = req.body || {};
  if (!subject || !message) return res.status(400).json({ error: "Subject and message are required." });

  const rows = await db.listRegistrations({ status: "paid", courseId: courseId === "all" ? undefined : courseId });
  const recipients = [...new Set(rows.map((r) => r.email))];
  if (recipients.length === 0) return res.status(400).json({ error: "No paid registrants match that selection." });

  const result = await emailer.sendBulkMessage({ recipients, subject, message });
  res.json({ ok: true, sentTo: recipients.length, result });
});

module.exports = router;
