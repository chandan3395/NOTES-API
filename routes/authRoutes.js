// creating a route
const express = require("express");

// creates a mini router
const router = express.Router();

const {registerUser,loginUser, refreshAccessToken,logoutUser,forgotPassword,resetPassword} = require("../controller/authController");
const {protect} = require("../middleware/protect") ;

// when someone calls auth/...
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshAccessToken) ; // get new access token
router.post("/logout", logoutUser) ;          // kill the session
router.post("/forgot-password", forgotPassword) ;
router.post("/reset-password", resetPassword) ;

router.get("/profile",protect,(req,res) => {
    res.json({
        message: "Protected route accessed",
        user: req.user
    });
})

module.exports = router;
