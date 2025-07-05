const express = require("express");
const router = express.Router();
const { login, signup } = require("../controllers/AuthController.js");
const { Auth } = require("../middleware/auth.js"); 

router.post("/signup", signup);
router.post("/login", login);


module.exports = router;
