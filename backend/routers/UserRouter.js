const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload.js");
const {  getUserDetails,updateUserDetails,uploadProfilePicture } = require("../controllers/UserController.js");
const { Auth } = require("../middleware/auth.js"); 

router.get("/:id",getUserDetails);
router.put("/:id",updateUserDetails);
router.post("/:id/upload-profile",upload.single('profile'),uploadProfilePicture);


module.exports = router;
