const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

// DEMO MODE: if no database is configured yet, fall back to an in-memory
// store so the app still runs end-to-end for local testing. This is clearly
// labelled in the UI (see public/js/register.js) and is NOT used once
// DATABASE_URL is set — real deployments must configure a real database.
const demoStore = [];
let demoCounter = 1;

const isDemo = !connectionString;

const pool = isDemo
  ? null
  : new Pool({
      connectionString,
      ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
    });

async function insertRegistration(reg) {
  if (isDemo) {
    const row = { id: String(demoCounter++), status: "pending", created_at: new Date().toISOString(), ...reg };
    demoStore.push(row);
    return row;
  }
  const { rows } = await pool.query(
    `insert into registrations
      (full_name, email, whatsapp, address, kin_name, kin_phone, course_ids,
       subtotal_kobo, reg_fee_kobo, discount_kobo, total_kobo, paystack_reference, status)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'pending')
     returning *`,
    [
      reg.full_name,
      reg.email,
      reg.whatsapp,
      reg.address,
      reg.kin_name,
      reg.kin_phone,
      reg.course_ids,
      reg.subtotal_kobo,
      reg.reg_fee_kobo,
      reg.discount_kobo,
      reg.total_kobo,
      reg.paystack_reference,
    ]
  );
  return rows[0];
}

// Excludes the heavy receipt_data blob — callers that need the actual file
// use getReceipt() below instead. Keeps every routine status check light.
const LIST_COLUMNS = `id, full_name, email, whatsapp, address, kin_name, kin_phone, course_ids,
  subtotal_kobo, reg_fee_kobo, discount_kobo, total_kobo, paystack_reference, status,
  created_at, paid_at, confirmation_email_sent_at, (receipt_data is not null) as has_receipt`;

async function getRegistrationByReference(reference) {
  if (isDemo) {
    const row = demoStore.find((r) => r.paystack_reference === reference);
    return row ? { ...row, has_receipt: !!row.receipt_data } : null;
  }
  const { rows } = await pool.query(
    `select ${LIST_COLUMNS} from registrations where paystack_reference = $1`,
    [reference]
  );
  return rows[0] || null;
}

async function markRegistrationPaid(reference) {
  if (isDemo) {
    const row = demoStore.find((r) => r.paystack_reference === reference);
    if (row && row.status !== "paid") {
      row.status = "paid";
      row.paid_at = new Date().toISOString();
    }
    return row;
  }
  const { rows } = await pool.query(
    `update registrations
     set status = 'paid', paid_at = now()
     where paystack_reference = $1 and status <> 'paid'
     returning *`,
    [reference]
  );
  if (rows[0]) return rows[0];
  // Already paid (idempotent replay) — return current row instead of null.
  return getRegistrationByReference(reference);
}

async function markConfirmationEmailSent(reference) {
  if (isDemo) {
    const row = demoStore.find((r) => r.paystack_reference === reference);
    if (row) row.confirmation_email_sent_at = new Date().toISOString();
    return;
  }
  await pool.query(
    `update registrations set confirmation_email_sent_at = now() where paystack_reference = $1`,
    [reference]
  );
}

async function listRegistrations({ status, courseId } = {}) {
  if (isDemo) {
    return demoStore
      .filter((r) => {
        if (status && r.status !== status) return false;
        if (courseId && !r.course_ids.includes(courseId)) return false;
        return true;
      })
      .map((r) => ({ ...r, has_receipt: !!r.receipt_data }));
  }
  const clauses = [];
  const params = [];
  if (status) {
    params.push(status);
    clauses.push(`status = $${params.length}`);
  }
  if (courseId) {
    params.push(courseId);
    clauses.push(`$${params.length} = any(course_ids)`);
  }
  const where = clauses.length ? `where ${clauses.join(" and ")}` : "";
  const { rows } = await pool.query(
    `select ${LIST_COLUMNS} from registrations ${where} order by created_at desc`,
    params
  );
  return rows;
}

async function saveReceipt(reference, buffer, mimeType) {
  if (isDemo) {
    const row = demoStore.find((r) => r.paystack_reference === reference);
    if (row) {
      row.receipt_data = buffer;
      row.receipt_mime = mimeType;
      row.receipt_uploaded_at = new Date().toISOString();
    }
    return !!row;
  }
  const { rowCount } = await pool.query(
    `update registrations set receipt_data = $1, receipt_mime = $2, receipt_uploaded_at = now()
     where paystack_reference = $3`,
    [buffer, mimeType, reference]
  );
  return rowCount > 0;
}

async function getReceipt(reference) {
  if (isDemo) {
    const row = demoStore.find((r) => r.paystack_reference === reference);
    if (!row || !row.receipt_data) return null;
    return { data: row.receipt_data, mime: row.receipt_mime };
  }
  const { rows } = await pool.query(
    `select receipt_data, receipt_mime from registrations where paystack_reference = $1`,
    [reference]
  );
  if (!rows[0] || !rows[0].receipt_data) return null;
  return { data: rows[0].receipt_data, mime: rows[0].receipt_mime };
}

// Demo-mode progress store, keyed "courseId:week" — separate from
// demoStore since progress isn't tied to any one registration.
const demoProgress = new Map();

async function getAllProgress() {
  if (isDemo) {
    return [...demoProgress.values()];
  }
  const { rows } = await pool.query(`select * from curriculum_progress`);
  return rows;
}

async function upsertProgress(courseId, week, { status, note, updatedBy }) {
  if (isDemo) {
    const key = `${courseId}:${week}`;
    const row = {
      course_id: courseId,
      week_number: week,
      status,
      note: note || null,
      updated_by: updatedBy || null,
      updated_at: new Date().toISOString(),
    };
    demoProgress.set(key, row);
    return row;
  }
  const { rows } = await pool.query(
    `insert into curriculum_progress (course_id, week_number, status, note, updated_by, updated_at)
     values ($1, $2, $3, $4, $5, now())
     on conflict (course_id, week_number)
     do update set status = $3, note = $4, updated_by = $5, updated_at = now()
     returning *`,
    [courseId, week, status, note || null, updatedBy || null]
  );
  return rows[0];
}

module.exports = {
  isDemo,
  insertRegistration,
  getRegistrationByReference,
  markRegistrationPaid,
  markConfirmationEmailSent,
  listRegistrations,
  saveReceipt,
  getReceipt,
  getAllProgress,
  upsertProgress,
};
