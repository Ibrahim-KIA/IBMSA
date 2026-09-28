# IBM School Skill Acquisition Program — Registration Portal

A registration and payment site for **Batch B**. Students fill in their
details, pick one or more courses, and pay — their spot is only confirmed
once payment is verified. They then get a confirmation email with the
WhatsApp group link. You (the admin) get a dashboard to see who's registered
for each course, export the list, and message everyone at once.

**Not technical? Start here:** [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md) —
a full, plain-English, step-by-step walkthrough of everything you need to do
to take this live, including where to click for Paystack, Supabase, Resend,
and Render.

**Right now, payment is by bank transfer**, confirmed by hand in `/admin/`
(set in `.env` as `PAYMENT_METHOD=bank_transfer`) — this works immediately,
with no external account needed, while Paystack's business verification is
pending. Switch to automatic Paystack payment later by changing that one
setting to `PAYMENT_METHOD=paystack` once your Paystack account is approved
— see Step 7 in the setup guide.

## What's in this project

```
public/            The website itself (registration form, success page, admin panel)
routes/             The server's API — registration, payment verification, admin
src/                Shared logic: course prices, database, email, Paystack, admin login
supabase/schema.sql The one-time database setup script
scripts/            Helper to generate your admin password
docs/SETUP_GUIDE.md Full non-technical setup + deployment instructions
.env.example        Every setting the site needs, documented
```

## Try it locally (no accounts needed)

```bash
npm install
npm start
```

Then open `http://localhost:3000`. With no `.env` file (or an empty one),
the site runs in a clearly-labelled **demo mode**: payments are simulated
and emails are only printed to the terminal, so you can click through the
whole experience safely. Admin panel: `http://localhost:3000/admin/`, demo
login `admin@demo.local` / `demo1234`.

## Key design decisions (and why)

- **The browser never sets the price.** Every course's price lives only in
  [`src/courses.js`](src/courses.js) on the server. The registration form
  only ever sends which courses were ticked — the total charged is always
  computed server-side. This is the standard way to stop someone editing the
  page to pay less.
- **A spot is "confirmed" only after Paystack verifies the payment** — via
  both the redirect back to the site and Paystack's own webhook (so it still
  works even if someone closes their browser right after paying).
- **The WhatsApp group link is never in the page you can view before
  paying** — it's only returned by the server once a payment is confirmed,
  and it's included in the confirmation email.
- **All money is stored as whole kobo (integers)**, never fractional naira,
  to avoid rounding errors — the same rule any real payment system follows.

## Changing course prices or adding a course

Edit the list in [`src/courses.js`](src/courses.js) — nothing else needs to
change; the registration form and pricing math both read from that one file.
