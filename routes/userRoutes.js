const express = require("express");
const router = express.Router();
const { uploadAvatar, getProfile } = require("../controller/userController");
const { protect } = require("../middleware/protect");
const upload = require("../config/multerConfig");

router.get("/profile", protect, getProfile);

// upload.single("avatar") → tells Multer to look for ONE file in the "avatar" field
// it runs before uploadAvatar — by the time your controller runs, req.file is ready
router.post("/avatar", protect, upload.single("avatar"), uploadAvatar);

module.exports = router;