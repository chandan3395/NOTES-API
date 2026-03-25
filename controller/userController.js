const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
const logger = require("../utils/logger");

// @desc   Upload profile picture
// @route  POST /users/avatar
// @access private
exports.uploadAvatar = asyncHandler(async (req, res) => {

    // req.file is populated by Multer middleware
    // if no file was sent, req.file is undefined
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    // upload local file to Cloudinary → get back the permanent URL
    const avatarUrl = await uploadToCloudinary(req.file.path);

    // save the Cloudinary URL to the user's document in MongoDB
    const user = await User.findByIdAndUpdate(
        req.user.id,
        { avatar: avatarUrl },
        { new: true }           // return the updated document
    ).select("-password");      // don't return the password field

    logger.info(`Avatar updated for user ${req.user.id}`);

    res.status(200).json({
        message: "Avatar uploaded successfully",
        avatar: user.avatar
    });
});

// @desc   Get user profile
// @route  GET /users/profile
// @access private
exports.getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");

    if (!user)
        return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
});