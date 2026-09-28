// Which way registrants pay. "bank_transfer" needs zero external accounts and
// works immediately — you confirm each payment yourself in the admin panel.
// "paystack" is automatic but needs your Paystack business verification to
// finish first. Switch anytime by changing PAYMENT_METHOD in .env — nothing
// else needs to change.
const PAYMENT_METHOD = (process.env.PAYMENT_METHOD || "bank_transfer").trim();

const BANK_DETAILS = {
  bankName: process.env.BANK_NAME || "",
  accountNumber: process.env.BANK_ACCOUNT_NUMBER || "",
  accountName: process.env.BANK_ACCOUNT_NAME || "",
};

module.exports = { PAYMENT_METHOD, BANK_DETAILS };
