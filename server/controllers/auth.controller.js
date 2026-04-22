const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    // 1. EXTRACT ALL FIELDS from the request body
    const { name, email, password, age, city, gender, bloodGroup } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. CREATE THE USER with all biometric data
    // Note: If your User model has the 'pre-save' hashing we added,
    // you don't need to manually hash here, but it's safer to keep it consistent.
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await User.create({
      name,
      email,
      password: hashedPassword,
      age,
      city,
      gender,
      bloodGroup,
    });

    // 3. CREATE TOKEN
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret",
      {
        expiresIn: process.env.JWT_EXPIRE || "7d",
      },
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        bloodGroup: user.bloodGroup,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret",
      {
        expiresIn: process.env.JWT_EXPIRE || "7d",
      },
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        bloodGroup: user.bloodGroup,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error during login" });
  }
};
