const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema({
    // which user does this token belong to
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // we store the HASHED version, never raw
    token: {
        type: String,
        required: true
    },
    // MongoDB will automatically delete the document after 7 days
    expiresAt: {
        type: Date,
        required: true,
        expires: 0   // TTL index — Mongo auto-deletes when expiresAt is reached
    }
});

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);

// This tells MongoDB: "When the current time reaches the value stored in expiresAt, delete this document."
// The 0 means 0 seconds delay after the expiresAt time is reached. So deletion happens as soon as that timestamp passes.