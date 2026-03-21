const jwt = require("jsonwebtoken");

// Takes the user object and signs a short-lived access token
const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },  // payload
        process.env.JWT_SECRET,
        { expiresIn: "15m" }                // short-lived
    );
};

module.exports = generateAccessToken;