const Bookmark = require("../models/BookmarkModel.js");

async function getAllBookmarks(req, res) {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user.id });
    res.status(200).json(bookmarks);
  } catch (err) {
    console.error("Error fetching bookmarks:", err);
    res.status(500).json({ message: "Server error" });
  }
}

async function addBookmark(req, res) {
  const { postId } = req.body;
  if (!postId) {
    return res.status(400).json({ message: "Post ID is required" });
  }

  try {
    const newBookmark = new Bookmark({
      userId: req.user.id,
      postId,
    });
    await newBookmark.save();
    res.status(201).json(newBookmark);
  } catch (err) {
    console.error("Error adding bookmark:", err);
    res.status(500).json({ message: "Server error" });
  }
}

async function deleteBookmark(req, res) {
  const { id } = req.params;
  try {
    const bookmark = await Bookmark.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });
    if (!bookmark) {
      return res.status(404).json({ message: "Bookmark not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting bookmark:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  getAllBookmarks,
  addBookmark,
  deleteBookmark,
};
