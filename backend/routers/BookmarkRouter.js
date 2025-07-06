const express = require("express");
const router = express.Router();
const {
  getAllBookmarks,
  bookmarkProblem,
  deleteBookmark,
} = require("../controllers/BookmarkController.js");
const { Auth } = require("../middleware/auth.js");

router.post("/", Auth, bookmarkProblem);
router.get("/", Auth, getAllBookmarks);
router.delete("/:id", Auth, deleteBookmark);


module.exports = router;
