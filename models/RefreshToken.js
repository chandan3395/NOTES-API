const mongoose = require("mongoose") ;

const refreshTokenSchema = new mongoose.Schema({

    // To get which user it belongs to
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user" ,
        required: true
    },

    // we have to store the hashed version of it 
    token: {
        type: String,
        required: true
    },

    // MongoDB will automatically delete the document after 7 days
    expiresAt: {
        type: Date,
        required: true,
        expires: 0 
    }
}) ;

module.exports = mongoose.model("RefreshToken",refreshTokenSchema) ;

// what is expires: 0 ??
// This tells MongoDB: "When the current time reaches the value stored in expiresAt, delete this document."
// The 0 means 0 seconds delay after the expiresAt time is reached. So deletion happens as soon as that timestamp passes.

// 💡 MongoDB runs a background thread every 60 seconds to check and delete expired 
// documents — so deletion isn't instant to the millisecond, but close enough for most 
// use cases like sessions, OTPs, or tokens.