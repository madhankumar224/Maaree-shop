const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const { auth } = require("../middleware/auth");

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/register
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, password } = req.body;
      if (await User.findOne({ email })) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const user = await User.create({ name, email, password });
      res.status(201).json({ user, token: generateToken(user._id) });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// POST /api/auth/login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ user, token: generateToken(user._id) });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// POST /api/auth/google - Google SSO login
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ message: "Invalid Google token" });
    }

    const { sub: googleId, email, name } = payload;

    // Find by googleId first, then by email
    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        // Link existing email account to Google
        user.googleId = googleId;
        await user.save();
      } else {
        // Create new user from Google profile
        user = await User.create({
          name: name || email.split("@")[0],
          email,
          googleId,
        });
      }
    }

    const isNewAccount = !user.createdAt || (Date.now() - new Date(user.createdAt).getTime()) < 5000;
    res.json({ user, token: generateToken(user._id), isNewAccount });
  } catch (error) {
    res.status(401).json({ message: "Google authentication failed" });
  }
});

// GET /api/auth/me
router.get("/me", auth, (req, res) => {
  res.json(req.user);
});

// PUT /api/auth/me - Update own profile (name)
router.put("/me", auth, async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (name && name.trim()) user.name = name.trim();
    await user.save();
    const updated = user.toObject();
    delete updated.password;
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/auth/users - Admin: get all users
router.get("/users", auth, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/auth/users/:id - Admin: delete a user
router.delete("/users/:id", auth, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/auth/users/:id - Admin: update user name/email
router.put("/users/:id", auth, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  try {
    const { name, email } = req.body;
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }
    if (email && email !== targetUser.email) {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: "Email already in use" });
      targetUser.email = email;
    }
    if (name) targetUser.name = name;
    await targetUser.save();
    const updated = targetUser.toObject();
    delete updated.password;
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/auth/users/:id/password - Admin: update user password
router.put("/users/:id/password", auth, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }
    targetUser.password = password;
    await targetUser.save();
    res.json({ message: "Password updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/users - Admin: create a user (can set admin)
router.post(
  "/users",
  auth,
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    try {
      const { name, email, password, isAdmin } = req.body;
      if (await User.findOne({ email })) {
        return res.status(400).json({ message: "Email already registered" });
      }
      const user = await User.create({ name, email, password, isAdmin: !!isAdmin });
      const userObj = user.toObject();
      delete userObj.password;
      res.status(201).json(userObj);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
