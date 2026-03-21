const crypto = require("crypto"); // built-in node

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

module.exports = hashToken;

// We use crypto (Node's built-in module) instead of bcrypt here because we need 
// to hash the same token consistently and compare it later — bcrypt generates 
// a different hash every time due to its salt, which is great for passwords but 
// breaks this use case.
