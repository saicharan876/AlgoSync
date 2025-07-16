const Bookmark = require("../models/BookmarkModel.js");
const { mapCodeforcesToLocalModel } = require("../utils/CodeForcesAPI.js");

async function getAllBookmarks(req, res) {
  try {
    const bookmarks = await Bookmark.find({
      createdBy: req.user._id || req.user.id,
    });
    res.status(200).json(bookmarks);
  } catch (err) {
    console.error("Error fetching bookmarks:", err);
    res.status(500).json({ message: "Server error" });
  }
}

async function bookmarkProblem(req, res) {
  try {
    const { problem } = req.body;
    const userId = req.user._id || req.user.id;
    
    if (!problem || !(problem.name || problem.title)) {
      return res.status(400).json({ message: "Invalid problem data" });
    }

    const existing = await Bookmark.findOne({
      title: problem.name,
      platform: "codeforces",
      createdBy: userId,
    });

    if (existing) {
      return res.status(409).json({ message: "Already bookmarked" });
    }

    const mapped = mapCodeforcesToLocalModel(problem, userId);

    const bookmark = new Bookmark({
      name: mapped.name,
      title: mapped.title,
      platform: "codeforces",
      content: mapped.description,
      tags: mapped.tags,
      difficulty: mapped.difficulty,
      solution: "",
      dateAdded: new Date().toISOString().split("T")[0],
      createdBy: userId,
    });

    await bookmark.save();
    res.status(201).json({ message: "Bookmarked successfully", bookmark });
  } catch (err) {
    console.error("Bookmark error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

async function deleteBookmark(req, res) {
  const { id } = req.params;
  try {
    const bookmark = await Bookmark.findOneAndDelete({
      _id: id,
      createdBy: req.user._id,
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
  bookmarkProblem,
  deleteBookmark,
};
