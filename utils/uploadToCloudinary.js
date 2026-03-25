const cloudinary = require("cloudinary").v2;
const fs = require("fs"); // built into Node — handles file system operations

// configure cloudinary with your credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// takes the local file path, uploads to Cloudinary, deletes the local file
const uploadToCloudinary = async (filePath) => {
    try {
        // upload to Cloudinary — returns an object with the hosted image URL
        const result = await cloudinary.uploader.upload(filePath, {
            folder: "notes_api/avatars"  // organizes files in Cloudinary dashboard
        });

        // delete the temp file from your server — we don't need it anymore
        // the file now lives permanently on Cloudinary's servers
        fs.unlinkSync(filePath);

        return result.secure_url; // the permanent HTTPS URL of the uploaded image

    } catch (err) {
        fs.unlinkSync(filePath); // still delete local file even if Cloudinary fails
        throw err;
    }
};

module.exports = uploadToCloudinary;