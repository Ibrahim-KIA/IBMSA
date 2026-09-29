require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");

const registerRoutes = require("./routes/register");
const paymentRoutes = require("./routes/payment");
const adminRoutes = require("./routes/admin");
const tutorRoutes = require("./routes/tutor");
const db = require("./src/db");
const paystack = require("./src/paystack");
const emailer = require("./src/email");
const tutorAuth = require("./src/tutor-auth");

const app = express();
app.disable("x-powered-by");

// The Paystack webhook needs the exact raw bytes to verify the signature,
// so it must be mounted BEFORE the JSON body parser touches the request.
app.post("/api/webhooks/paystack", express.raw({ type: "*/*" }), (req, res, next) => {
  req.rawBodyRoute = true;
  next();
}, paymentRoutes);

app.use(express.json());
app.use(cookieParser());

app.get("/api/demo-status", (req, res) => {
  res.json({
    demo: db.isDemo || paystack.isDemo || emailer.isDemo,
    dbDemo: db.isDemo,
    paystackDemo: paystack.isDemo,
    emailDemo: emailer.isDemo,
  });
});

app.use("/api", registerRoutes);
app.use("/api", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tutor", tutorRoutes);

app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`IBM School registration portal running at http://localhost:${PORT}`);
  if (db.isDemo) console.log("  -> DEMO MODE: no DATABASE_URL set, using in-memory storage.");
  if (paystack.isDemo) console.log("  -> DEMO MODE: no PAYSTACK_SECRET_KEY set, payments are simulated.");
  if (emailer.isDemo) console.log("  -> DEMO MODE: no RESEND_API_KEY set, emails are only logged here.");
  if (tutorAuth.isDemo) console.log("  -> DEMO MODE: no TUTOR_ACCESS_TOKEN set, using a fixed demo link: /tutor?token=demo-tutor-access");
});
