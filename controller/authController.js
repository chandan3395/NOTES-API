const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken") ;
const generateAccessToken = require("../utils/generateAccessToken") ;
const generateRefreshToken = require("../utils/generateRefreshToken") ;
const hashToken = require("../utils/hashToken") ;
const RefreshToken = require("../models/RefreshToken") ;
const crypto = require("crypto") ;
const sendEmail = require("../utils/sendEmail") ;
const PasswordResetToken = require("../models/PasswordResetToken") ;
const logger = require("../utils/logger") ;


exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields required" });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // HASH PASSWORD
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "User registered",
            user
        });

    } catch (error) {
        console.error("REGISTER ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.loginUser = async (req,res) => {
    try{
        const {email , password} = req.body ;
        if(!email || !password){
            return res.status(400).json({message: "All fields are required"}) ;
        }

        const user = await User.findOne({email}) ;

        if(!user){
            return res.status(400).json({message: "Did not find the User"}) ;
        }

        const isMatch = await bcrypt.compare(password,user.password) ;

        if(!isMatch){
            return res.status(400).json({message: "did not match"}) ;
        }

        const accessToken = generateAccessToken() ;
        const refreshToken = generateRefreshToken() ;

        await RefreshToken.create({
            user: user.id, 
            token: hashToken(refreshToken),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }) ;

        res.status(200).json({message: "Login succesfull",accessToken, refreshToken}) ;

    }catch(error){
        console.log("LOGIN ERROR: ",error) ;
        return res.status(500).json({message: "Server error"}) ;
    }
}

exports.refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken)
            return res.status(400).json({ message: "Refresh token required" });

        // Verify the token signature and expiry
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        // Check if the hashed version exists in DB
        const hashed = hashToken(refreshToken);
        const stored = await RefreshToken.findOne({ token: hashed, user: decoded.id });

        if (!stored)
            return res.status(401).json({ message: "Invalid or expired refresh token" });

        // Issue a new access token
        const user = await User.findById(decoded.id);
        const newAccessToken = generateAccessToken(user);

        res.status(200).json({ accessToken: newAccessToken });

    } catch (error) {
        return res.status(401).json({ message: "Refresh token invalid or expired" });
    }
};

exports.logoutUser = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken)
            return res.status(400).json({ message: "Refresh token required" });

        // Delete hashed token from DB → session is now dead
        await RefreshToken.deleteOne({ token: hashToken(refreshToken) });

        res.status(200).json({ message: "Logged out successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// @desc Send password reset link to user's mail
// @route POST /auth/forgot-password
// @access public
exports.forgotPassword = async (req,res) => {
    try{
        const { email } = email ;
        if(!email)
            return res.status(400).json({message: "Email is required"}) ;
        
        const user = await user.findOne({email}) ;
        
        // no matter if the user is not there or not we have send the same response
        // why?? --> if some stalker gets to know some of the real user's email id then problem may arise that's why
        // we have to send the same response in both cases of user existing or not
        if(!user)
            return res.status(200).json({ message: "if the mail exists, a reset link has been sent out successfully"});
        
        // creating a new token --> this is what goes in the email URL
        const rawToken = crypto.randomBytes(32).toString("hex") ;

        // Delete any existing reset tokens for this user (only one active at a time)
        await PasswordResetToken.deleteOne({user: user._id}) ;

        await PasswordResetToken.create({
            user: user._id,
            token: hashToken(rawToken) 
        }) ;

        const resetLink = `${process.env.CLIENT_URL} / reset-password?token=${rawToken}&id=${user._id}`

        await sendEmail({
            to: user.email,
            subject: "Password Reset Request",
            html: `
                <h2>Password Reset</h2>
                <p>You requested a password reset. Click the link below:</p>
                <a href="${resetLink}">Reset My Password</a>
                <p>This link expires in 15 minutes.</p>
                <p>If you didn't request this, ignore this email.</p>
            `
        });

        res.status(200).json({ message: "if the mail exists, a reset link has been sent out successfully"});
    }catch (err) {
        logger.error(`Forgot password error: ${error.message}`) ;
        res.status(500).json({ message: "Server error" });
    }
};

// @desc Reset the user's password using the token from email 
// @route POST /auth/reset-password
// @access public
exports.resetPassword = async (req,res) => {
    try{ 
        const { token, userId, newPassword } = req.body;
        if (!token || !userId || !newPassword)
            return res.status(400).json({ message: "All fields required" });

         // Find the stored token record by hashing the incoming raw token
        const stored = await PasswordResetToken.findOne({
            user: userId,
            token: hashToken(token)   // hash and compare — same pattern as refresh tokens
        });

        if (!stored)
            return res.status(400).json({ message: "Invalid or expired reset token" });

        // Token is valid — update the user's password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(userId, { password: hashedPassword });

        // Delete the reset token — one-time use only
        await PasswordResetToken.deleteOne({ _id: stored._id });

        res.status(200).json({ message: "Password reset successful" });
    }catch (error) {
        logger.error(`Reset password error: ${error.message}`);
        res.status(500).json({ message: "Server error" });
    }
}
