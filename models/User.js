const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    avatar: {
    type: String,
    default: null  // null means no avatar uploaded yet
    }
},
{ timestamps: true } // when the user is created date and time 
);

// export userSchema as "User"
module.exports = mongoose.model("User", userSchema);
