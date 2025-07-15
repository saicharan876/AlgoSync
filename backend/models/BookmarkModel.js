// models/BookmarkModel.js
const mongoose = require("mongoose");

const BookmarkSchema = new mongoose.Schema({
  name: { type: String, required: true },         
  platform: String,
  content: String,
  tags: [String],
  difficulty: String,
  solution: String,
  dateAdded: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Bookmark", BookmarkSchema);
