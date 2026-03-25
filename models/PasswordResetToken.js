// it stores a hashed token linked to a user with automatic TTL expiry
const mongoose = require("mongoose") ;

const passwordResetTokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    token: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 15*60*1000), // 15 min
    }
}) ;

module.exports = mongoose.model("PasswordResetToken" , passwordResetTokenSchema) ;