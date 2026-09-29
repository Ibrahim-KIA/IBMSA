// Tutors get one shared secret link rather than individual accounts —
// simplest thing that works for a handful of trusted tutors, distributed
// by the owner over WhatsApp/email. Anyone with the link can view and
// update progress, so treat the link itself as the credential: don't post
// it anywhere public.
const crypto = require("crypto");

const TUTOR_TOKEN = process.env.TUTOR_ACCESS_TOKEN;
const COOKIE_NAME = "ibmsa_tutor";

const isDemo = !TUTOR_TOKEN;
const DEMO_TOKEN = "demo-tutor-access";

function currentToken() {
  return isDemo ? DEMO_TOKEN : TUTOR_TOKEN;
}

function timingSafeEqual(a, b) {
  const bufA = Buffer.from(String(a || ""));
  const bufB = Buffer.from(String(b || ""));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// Accepts the token from a query string (first visit, from the shared link)
// or a cookie (subsequent visits) and sets the cookie so the query string
// doesn't need to stay in the URL a tutor bookmarks or re-shares.
function requireTutor(req, res, next) {
  const fromQuery = req.query.token;
  const fromCookie = req.cookies && req.cookies[COOKIE_NAME];
  const provided = fromQuery || fromCookie;

  if (!provided || !timingSafeEqual(provided, currentToken())) {
    return res.status(401).json({ error: "Invalid or missing tutor access link." });
  }
  if (fromQuery) {
    res.cookie(COOKIE_NAME, fromQuery, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 180 * 24 * 60 * 60 * 1000, // 180 days — tutors shouldn't have to re-click the link often
    });
  }
  next();
}

module.exports = { isDemo, requireTutor };
