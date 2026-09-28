// Turns a plain-text password into the scrambled hash you paste into
// ADMIN_PASSWORD_HASH in your .env file. Run it like this:
//
//   npm run hash-password -- "your-chosen-password"
//
const bcrypt = require("bcryptjs");

const password = process.argv[2];
if (!password) {
  console.error('Usage: npm run hash-password -- "your-chosen-password"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log("\nPaste this into ADMIN_PASSWORD_HASH in your .env file:\n");
console.log(hash);
console.log("");
