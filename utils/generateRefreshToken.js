const jwt = require("jsonwebtoken");

// Long-lived token — used only to get a new access token
const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id },                       // minimal payload
        process.env.REFRESH_TOKEN_SECRET,       // DIFFERENT secret
        { expiresIn: "7d" }
    );
};

module.exports = generateRefreshToken;

// Notice it uses a **different secret** — `REFRESH_TOKEN_SECRET`. This is important. If both tokens share the same secret, a stolen access token could be used to forge a refresh token. Add this to your `.env`:


