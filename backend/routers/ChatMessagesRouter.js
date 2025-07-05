const express = require("express");
const { Auth } = require("../middleware/auth.js");
const { getAllmessages, addmessage } = require("../controllers/ChatMessagesController.js");


const router = express.Router();

router.post("/", Auth, addmessage);
router.get("/", Auth, getAllmessages);


module.exports = router;