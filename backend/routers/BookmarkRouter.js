const express = require("express");
const router = express.Router();
const {
  getAllBookmarks,
  addBookmark,
  deleteBookmark,
} = require("../controllers/BookmarkController.js");
const { Auth } = require("../middleware/auth.js");

router.post("/", Auth, addBookmark);
router.get("/", Auth, getAllBookmarks);
router.delete("/:id", Auth, deleteBookmark);


module.exports = router;
