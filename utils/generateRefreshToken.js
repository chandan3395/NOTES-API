const jwt = require("jsonwebtoken") 

const generateRefreshToken = (user) => {
    return jwt.sign(
        {id: user._id},                     // minimal-payload
        process.env.REFRESH_TOKEN_SECRET,   // diffrent secret
        {expiresIn: "7d" }                  // long-lived
    );
};

module.exports = generateRefreshToken ;

// Notice it uses a **different secret** — `REFRESH_TOKEN_SECRET`. This is important. If both tokens share the same secret, a stolen access token could be used to forge a refresh token. Add this to your `.env`:
