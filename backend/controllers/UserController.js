const User = require("../models/UserModel.js");

async function getUserDetails(req, res) {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Server error" });
  }
}

async function updateUserDetails(req, res) {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select("-passwordHash"); // omit sensitive info

    res.json(updatedUser);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating user", error: err.message });
  }
}

async function uploadProfilePicture(req, res) {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { profilePicture: `/uploads/${req.file.filename}` },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
}

module.exports = {
  getUserDetails,
  updateUserDetails,
  uploadProfilePicture,
};