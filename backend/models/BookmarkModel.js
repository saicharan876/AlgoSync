const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  qid:         { type: String },
  platform:    { type: String },
  content:     { type: String, required: true },
  tags:        [String],
  difficulty:  { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
  solution:    { type: String },
  dateAdded:   { type: String },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Bookmark', BookmarkSchema);