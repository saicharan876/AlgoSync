const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    bio: { type: String, default: "" },
    city: String,
    region: String,
    country: String,
    institute: String,
    linkedin: String,
    handles: {
      github: String,
      codeforces: String,
      atcoder: String,
      leetcode: String,
    },
    profilePicture: { type: String, default: "" },
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bookmark" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
