# Setup Guide — IBM School Skill Acquisition Program Registration Portal

This guide assumes no technical background. Follow it top to bottom. Each
section tells you exactly where to click and what to copy.

> **Short on time?** The site is already set up to take payment by **bank
> transfer** — no waiting on Paystack's business verification required.
> Registrants see your bank details and a reference after filling the form;
> you confirm each one by hand in `/admin/` once you see the money land,
> which sends their confirmation email and reveals the WhatsApp link
> automatically. You can skip **Step 1 (Paystack)** entirely for now. You
> still need:
> - **Step 2 (Supabase)** — do not skip this one, even under time pressure.
>   Without it, registrations live only in the running server's memory and
>   are **permanently lost** every time it restarts (which happens on every
>   redeploy, and automatically after 15 minutes idle on the free plan).
>   Takes about 5 minutes.
> - **Step 3 (Resend)** — 3 minutes, no domain needed to start
>   (`onboarding@resend.dev` works immediately). Skipping it only means no
>   automatic confirmation emails — registrations still save safely and
>   still show in `/admin/` — but it's fast enough that there's little reason to skip it.
> - **Step 4** (admin password) and **Step 5** (Render) — required either way.
>
> In Step 5, set `PAYMENT_METHOD=bank_transfer` plus `BANK_NAME`,
> `BANK_ACCOUNT_NUMBER`, and `BANK_ACCOUNT_NAME` instead of the Paystack
> variables. Skip Steps 6–7 (those are Paystack-specific) until you switch
> payment methods later.

**The big picture:** your registration site needs four outside services to
work for real:

1. **Paystack** — takes the payment.
2. **Supabase** — stores registrations (names, courses, who's paid).
3. **Resend** — sends confirmation emails.
4. **Render** — hosts the website so it has a real web address.

All four have free tiers that are enough to run this program. Total running
cost: **₦0/month** to start (Paystack only takes their normal transaction fee
out of each payment, same as any payment provider — nothing extra).

Do the steps in this order. Each one takes 5–15 minutes.

---

## Before you start: try it on your own computer (optional but recommended)

The whole site already works in a safe "demo mode" with no accounts needed,
so you can click through everything first and see exactly what your
customers and you (as admin) will experience.

1. Install [Node.js](https://nodejs.org) (the "LTS" version) if you don't have it.
2. Open this folder in a terminal and run:
   ```bash
   npm install
   npm start
   ```
3. Open `http://localhost:3000` in your browser — that's the registration
   page. Fill it in and click "Pay & Register Now"; you'll land on a page
   clearly marked "DEMO MODE" instead of real Paystack, because no real keys
   are set up yet.
4. Open `http://localhost:3000/admin/` — log in with
   `admin@demo.local` / `demo1234` (demo-only, shown on screen too) — this is
   where you'll see registrants and send messages once it's live.

Once you're happy with how it looks and works, come back here and follow the
steps below to make it real.

---

## Step 1 — Paystack (takes the payment)

1. Go to **paystack.com** and click **Sign Up**. Use the school's email and phone number.
2. Choose **Nigeria** as your country.
3. Once logged in, you'll see a dashboard. In the left menu, go to
   **Settings → API Keys & Webhooks**.
4. You'll see a **Test Secret Key** (starts `sk_test_...`) and **Test Public
   Key** (starts `pk_test_...`). Copy both somewhere safe for now — you'll
   paste them into Render in Step 5. Use the **test** keys first; you'll
   switch to live keys only once everything is working end-to-end.
5. **To accept real money later**, Paystack needs to verify your business
   (this is a Nigerian banking requirement, not something Paystack chose
   arbitrarily). In your dashboard, look for a banner or **Compliance /
   Activate Your Account** section and follow it. You'll typically need:
   - Your BVN (Bank Verification Number)
   - If the school is a registered business: CAC registration documents and TIN
   - A valid ID
   This usually completes in 1–3 business days. **You can build and test
   everything else while this is pending** — you only need the live keys
   right before you open registration to the public.
6. Once approved, go back to **Settings → API Keys & Webhooks** and you'll
   now also see a **Live Secret Key** and **Live Public Key**. Don't touch
   these until Step 6 ("Going live") below.
7. Still on that same page, scroll to **Webhook URL** and leave it blank for
   now — you'll come back and fill this in after Step 5, once your site has
   a real web address.

**Test card, so you can try a full payment without spending real money:**
Card number `4084 0840 8408 4081`, any future expiry date, CVV `408`, PIN
`408408`, OTP `123456`.

---

## Step 2 — Supabase (stores registrations)

1. Go to **supabase.com** and sign up (you can use your Google/GitHub account
   or an email).
2. Click **New Project**. Name it something like `ibmsa-registrations`, set
   a database password (save it somewhere safe — a password manager or a
   written note kept securely), and pick a region close to Nigeria (e.g.
   Frankfurt or London — Supabase doesn't currently have a Lagos region).
3. Wait about 2 minutes for the project to finish setting up.
4. In the left menu, click the **SQL Editor** icon.
5. Open the file `supabase/schema.sql` from this project folder (open it in
   Notepad or any text editor), copy **all** of its contents, paste them
   into the Supabase SQL Editor, and click **Run**. You should see
   "Success. No rows returned." This created the table that will hold every
   registration.
6. In the left menu, go to **Project Settings → Database**. Scroll to
   **Connection string**, choose the **Transaction pooler** tab, and copy
   the URI. It looks like:
   `postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-x-pooler.supabase.com:6543/postgres`
   Replace `[YOUR-PASSWORD]` with the database password you set in step 2.
   Save this whole string — it's your `DATABASE_URL` for Step 5.

---

## Step 3 — Resend (sends confirmation emails)

1. Go to **resend.com** and sign up.
2. In the dashboard, go to **API Keys → Create API Key**. Name it
   `ibmsa-registration`, and copy the key (starts `re_...`). You only see it
   once — save it now for Step 5.
3. For the very first tests, you can send from `onboarding@resend.dev`
   (already set up in `.env.example` — no extra work). Real registrants will
   still receive these emails, but it looks less official and can
   occasionally land in spam.
4. **Recommended before going fully live:** if the school has its own domain
   (e.g. `ibmschool.ng`), go to **Domains → Add Domain** in Resend, and add
   the DNS records it gives you at your domain provider (wherever you bought
   the domain — e.g. Namecheap, Whogohost). Once verified (can take a few
   hours), you can send from `registrations@ibmschool.ng` instead, which
   looks far more trustworthy in inboxes. If the school has no domain yet,
   skip this — `onboarding@resend.dev` works fine to start.

Free tier: 3,000 emails/month, 100/day — comfortably enough for one program
batch.

---

## Step 4 — Generate your admin password

Your admin panel (where you see who's registered and send messages) needs a
password. For security, the site never stores your actual password — only a
scrambled version of it.

1. In this project folder, run:
   ```bash
   npm run hash-password -- "choose-a-strong-password-here"
   ```
2. It will print a long scrambled string starting with `$2a$...`. Copy that
   whole string — you'll paste it into Render as `ADMIN_PASSWORD_HASH` in
   Step 5. **Do not put your plain password anywhere except this command.**

---

## Step 5 — Deploy to Render (puts the site on the internet)

1. Go to **render.com** and sign up.
2. This project needs to be in a GitHub repository for Render to deploy it.
   If you don't already have the code on GitHub:
   - Go to **github.com**, sign up if needed, click **New repository**,
     name it `ibmsa-registration`, keep it **Private**, and create it.
   - Follow GitHub's "push an existing repository" instructions shown on
     that empty repo's page (a short set of `git` commands) from inside this
     project folder. If this step is unfamiliar, tell me and I'll do it with
     you.
3. In Render, click **New → Web Service**, connect your GitHub account, and
   pick the `ibmsa-registration` repository.
4. Fill in:
   - **Name:** `ibmsa-registration` (this becomes part of your web address)
   - **Region:** closest available to Nigeria
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free (you can upgrade later — see note below)
5. Before clicking Create, scroll to **Environment Variables** and add each
   of these (values from the steps above):

   | Key | Value |
   |---|---|
   | `BASE_URL` | your Render URL, e.g. `https://ibmsa-registration.onrender.com` (Render shows you this — you may need to fill it in after the first deploy, then redeploy) |
   | `DATABASE_URL` | from Step 2 |
   | `PAYMENT_METHOD` | `bank_transfer` for now (or `paystack` once Step 1 is approved) |
   | `BANK_NAME` | e.g. `GTBank` — only needed for `bank_transfer` |
   | `BANK_ACCOUNT_NUMBER` | the school's receiving account number — only needed for `bank_transfer` |
   | `BANK_ACCOUNT_NAME` | the exact name registered on that account — only needed for `bank_transfer` |
   | `PAYSTACK_PUBLIC_KEY` | `pk_test_...` from Step 1 — only needed once you switch `PAYMENT_METHOD` to `paystack` |
   | `PAYSTACK_SECRET_KEY` | `sk_test_...` from Step 1 — only needed once you switch `PAYMENT_METHOD` to `paystack` |
   | `RESEND_API_KEY` | from Step 3 |
   | `EMAIL_FROM` | `onboarding@resend.dev` (or your verified domain address) |
   | `WHATSAPP_GROUP_LINK` | your program's real group invite link (get a fresh one from WhatsApp: group info → Invite via link) |
   | `ADMIN_EMAIL` | the email you'll log into the admin panel with |
   | `ADMIN_PASSWORD_HASH` | the scrambled string from Step 4 |
   | `ADMIN_JWT_SECRET` | any long random text, e.g. mash your keyboard for 40+ characters |
   | `NODE_ENV` | `production` |

6. Click **Create Web Service**. Render will build and start the site —
   watch the **Logs** tab; when it says the site is running, visit your
   `https://....onrender.com` address to confirm the registration page loads.
7. Go back into **Environment**, double check `BASE_URL` exactly matches your
   live Render address (no trailing slash), save, and let it redeploy.
8. **Connect the Paystack webhook** (this is what guarantees a spot is marked
   paid even if someone closes their browser mid-payment): back in Paystack
   → **Settings → API Keys & Webhooks**, set the **Webhook URL** to:
   `https://your-render-address.onrender.com/api/webhooks/paystack`

**A note on the free Render plan:** it "falls asleep" after 15 minutes with
no visitors, so the first visitor after a quiet spell waits ~30-50 seconds
for the page to load. For ₦0 that's a fine trade-off to launch with. If that
feels too slow once real registrations are happening, Render's paid Starter
plan (~$7/month) keeps it always-on — you can switch anytime with no code
changes.

---

## Step 6 — Test it for real (still in Test Mode — no real money)

1. Visit your live site, fill in the registration form with a course or two,
   and click **Pay & Register Now** — this time you'll see Paystack's real
   test checkout page (not the demo one).
2. Pay using the test card from Step 1.
3. You should land on the success page with the WhatsApp link, and a
   confirmation email should arrive (check spam if using `onboarding@resend.dev`).
4. Log into `/admin/` with your real `ADMIN_EMAIL` and password, and confirm
   the registration shows up as **paid**, with the right course and total.
5. Try the **Message registrants** box to send yourself a test message.

If all of that works, you're ready to go live.

---

## Step 7 — Go live

1. Only once Paystack has approved your business (Step 1.5), go to
   **Settings → API Keys & Webhooks** and copy your **Live Secret Key** and
   **Live Public Key**.
2. In Render, update `PAYSTACK_SECRET_KEY` and `PAYSTACK_PUBLIC_KEY` to the
   live versions, and save (Render will redeploy automatically).
3. Also add the same webhook URL under **Live Mode** in Paystack (Paystack
   keeps test and live webhook URLs separate).
4. Do **one real ₦ registration yourself** with a real card to confirm
   everything works with real money before sharing the link publicly.
5. Share the registration link with students.

---

## Ongoing: how to use the admin panel

Go to `https://your-site.onrender.com/admin/` any time.

- **See who's registered:** the table at the bottom, filterable by course
  (via the "All courses" dropdown when messaging) and by paid/pending.
- **See totals per course:** the cards at the top.
- **Download everyone's details as a spreadsheet:** "Download CSV" button —
  opens fine in Excel or Google Sheets.
- **Email everyone (or one course) at once:** the "Message registrants" box.
- **Message one person on WhatsApp:** click their WhatsApp number in the
  table — it opens WhatsApp with their number and a starter message already
  filled in, ready for you to send from your own phone/WhatsApp Web.
- **Confirm a bank transfer (while `PAYMENT_METHOD=bank_transfer`):** check
  your bank app/alerts for a deposit matching the amount and the registrant's
  name, then click the green **Mark Paid** button next to their row. This is
  the moment their confirmation email goes out and the WhatsApp link is
  released — so only click it once you've actually seen the money. It cannot
  be automated for you since this app has no access to your bank account
  (that's a deliberate boundary — a script that could move or read your bank
  balance is a very different, much higher-risk thing to hand to software).

## What this system does NOT do (on purpose, for now)

- It does not send bulk messages over WhatsApp itself (WhatsApp's official
  "Business API" for that requires a paid, separately-approved WhatsApp
  Business Platform account — a real project on its own if you want it
  later). Right now, WhatsApp contact is one-by-one via the click-to-chat
  link, and the group is self-join.
- It does not charge the ₦3,000 certificate fee automatically — that's
  mentioned in the registration terms and confirmation email as a reminder
  for later in the program, since it wasn't part of what should be
  collected at registration.
- It has one login for "the admin" (you) — it's not built for multiple staff
  accounts with different permissions. If you need that later, it's a
  straightforward addition.

## Sources checked while building this (September 2026)

- [Paystack — Verify Payments](https://paystack.com/docs/payments/verify-payments/)
- [Paystack — Test Payments / test cards](https://paystack.com/docs/payments/test-payments/)
- [Paystack — Compliance requirements for Nigeria](https://support.paystack.com/en/articles/2123970)
- [Resend — Account quotas and limits](https://resend.com/docs/knowledge-base/account-quotas-and-limits)
- [Render — free PostgreSQL now expires after 30 days](https://render.com/changelog/free-postgresql-instances-now-expire-after-30-days-previously-90) (this is why the database lives on Supabase instead, not Render)
