const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken") ;
const generateAccessToken = require("../utils/generateAccessToken") ;
const generateRefreshToken = require("../utils/generateRefreshToken") ;
const hashToken = require("../utils/hashToken") ;


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

        const token = jwt.sign(
            {id: user._id},
            process.env.JWT_SECRET,
            {expiresIn: "1h"}
        );

        res.status(200).json({message: "Login succesfull",token}) ;

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
