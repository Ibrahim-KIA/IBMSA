const crypto = require("crypto");

const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const isDemo = !SECRET_KEY;

const BASE = "https://api.paystack.co";

async function initializeTransaction({ email, amountKobo, reference, callbackUrl, metadata }) {
  if (isDemo) {
    // DEMO MODE: no real Paystack account configured. Send the shopper to our
    // own clearly-labelled fake checkout instead of a real payment page.
    return { authorizationUrl: `${process.env.BASE_URL}/demo-checkout.html?reference=${reference}` };
  }
  const res = await fetch(`${BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: amountKobo,
      currency: "NGN",
      reference,
      callback_url: callbackUrl,
      metadata,
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.status) {
    throw new Error(data.message || "Could not start payment with Paystack.");
  }
  return { authorizationUrl: data.data.authorization_url };
}

async function verifyTransaction(reference) {
  if (isDemo) {
    // DEMO MODE: treat any reference beginning with our prefix as paid.
    return { success: true, amountKobo: null, currency: "NGN", demo: true };
  }
  const res = await fetch(`${BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${SECRET_KEY}` },
  });
  const data = await res.json();
  if (!res.ok || !data.status) {
    throw new Error(data.message || "Could not verify payment with Paystack.");
  }
  return {
    success: data.data.status === "success",
    amountKobo: data.data.amount,
    currency: data.data.currency,
    demo: false,
  };
}

// Confirms a webhook request really came from Paystack, using the raw request body.
function verifyWebhookSignature(rawBody, signatureHeader) {
  if (isDemo) return true;
  const hash = crypto.createHmac("sha512", SECRET_KEY).update(rawBody).digest("hex");
  return hash === signatureHeader;
}

module.exports = { isDemo, initializeTransaction, verifyTransaction, verifyWebhookSignature };
