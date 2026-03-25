const multer = require("multer");
const path = require("path"); // built into Node — handles file paths

// Disk storage — saves file to /uploads folder on your server temporarily
const storage = multer.diskStorage({

    // destination: which folder to save the file in
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // cb = callback, null = no error
    },

    // filename: what to name the saved file
    // we use Date.now() to make it unique — prevents overwriting files with same name
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname); // extracts ".jpg", ".png" etc
        cb(null, `${req.user.id}-${Date.now()}${ext}`);
    }
});

// fileFilter: runs before saving — reject files that aren't images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);  // accept the file
    } else {
        cb(new Error("Only JPEG, PNG, and WebP images are allowed"), false); // reject
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB max — prevents huge uploads
});

module.exports = upload;