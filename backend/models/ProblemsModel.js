const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  tags:        [String],
  difficulty:  { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
  solution:    { type: String },

  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Problem', ProblemSchema);