const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // 1. Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header (split "Bearer <token>")
      token = req.headers.authorization.split(" ")[1];

      // Verify token using your Secret Key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the database (excluding the password)
      req.user = await User.findById(decoded.id).select("-password");

      // Move to the next middleware or route handler
      return next();
    } catch (error) {
      console.error("JWT Error:", error.message);
      // Return here to prevent the "Headers Sent" error
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      });
    }
  }

  // 2. If no token was provided at all
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided",
    });
  }
};

// 3. Export as an object so it matches your require("{ protect }") in routes
module.exports = { protect };
