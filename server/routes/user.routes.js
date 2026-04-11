const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");

// GET /api/users/profile — get current user profile
router.get("/profile", protect, async (req, res) => {
  try {
    res.status(200).json({ success: true, user: req.user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/users/profile — update profile fields
router.put("/profile", protect, async (req, res) => {
  try {
    const User = require("../models/User");
    const allowed = [
      "name",
      "age",
      "gender",
      "bloodGroup",
      "city",
      "knownConditions",
    ];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/users/account — delete account
router.delete("/account", protect, async (req, res) => {
  try {
    const User = require("../models/User");
    await User.findByIdAndDelete(req.user._id);
    res.status(200).json({ success: true, message: "Account deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
