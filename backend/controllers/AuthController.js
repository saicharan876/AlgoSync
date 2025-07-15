const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel.js");

const SECRET = process.env.JWT_SECERT;


// Signup Controller
async function signup(req, res) {
  try {
    const { username, email, password, bio, city, region, country, institute, linkedin, handles } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      passwordHash: hashedPassword,
      bio,
      city,
      region,
      country,
      institute,
      linkedin,
      handles,
    });

    const token = jwt.sign({ id: newUser._id, email: newUser.email }, SECRET, { expiresIn: "1h" });

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

// Login Controller
async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign({ id: user._id, email: user.email }, SECRET, { expiresIn: "1h" });

    res.status(200).json({
      message: "Logged in successfully",
      token,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = { signup, login };
