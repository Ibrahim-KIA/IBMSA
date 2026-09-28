const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "demo-only-insecure-secret-change-me";
const COOKIE_NAME = "ibmsa_admin";

// DEMO MODE: if no admin password hash is configured, accept a fixed demo
// password so the admin panel is still explorable locally. This must never
// be relied on in production — set ADMIN_PASSWORD_HASH before deploying.
const isDemo = !ADMIN_PASSWORD_HASH;
const DEMO_EMAIL = "admin@demo.local";
const DEMO_PASSWORD = "demo1234";

async function verifyLogin(email, password) {
  if (isDemo) {
    return email === DEMO_EMAIL && password === DEMO_PASSWORD;
  }
  if (email !== ADMIN_EMAIL) return false;
  return bcrypt.compare(password, ADMIN_PASSWORD_HASH);
}

function issueSessionCookie(res) {
  const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "7d" });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME);
}

function requireAdmin(req, res, next) {
  const token = req.cookies && req.cookies[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: "Not logged in." });
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Session expired. Please log in again." });
  }
}

module.exports = { isDemo, DEMO_EMAIL, DEMO_PASSWORD, verifyLogin, issueSessionCookie, clearSessionCookie, requireAdmin };
