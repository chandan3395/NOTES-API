const crypto = require("crypto"); // built into Node, no install needed

// Takes a raw token string and returns a SHA-256 hash
const hashToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};

module.exports = hashToken;